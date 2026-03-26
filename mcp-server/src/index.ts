/**
 * Rainier Training Tracker — Remote MCP Server
 *
 * This is a Cloudflare Worker that exposes MCP tools for Claude
 * to read and write workout plans in Supabase.
 *
 * Deploy: cd mcp-server && npx wrangler deploy
 * Secrets: npx wrangler secret put SUPABASE_SERVICE_KEY
 *
 * Connect to Claude Desktop via the MCP server URL.
 */

import { getSupabase, Env } from './supabase';
import { getUserProfile, getCurrentPlan, getExerciseLogs, getProgressSummary } from './tools/read';
import { createWeekPlan, updateExercise, addExercise, removeExercise, updatePlanStatus } from './tools/write';

// MCP tool definitions
const TOOLS = [
  {
    name: 'get_user_profile',
    description: 'Get a user\'s profile including goals, constraints, and preferences. Use this to understand who you\'re planning for.',
    inputSchema: {
      type: 'object',
      properties: {
        user_name: { type: 'string', description: 'User name: "cody" or "kylie"' },
      },
      required: ['user_name'],
    },
  },
  {
    name: 'get_current_plan',
    description: 'Get the full workout plan for a user\'s specific week, including all days, sections, and exercises with their input configurations.',
    inputSchema: {
      type: 'object',
      properties: {
        user_name: { type: 'string', description: 'User name: "cody" or "kylie"' },
        week_number: { type: 'number', description: 'Week number (1, 2, 3, etc.)' },
      },
      required: ['user_name', 'week_number'],
    },
  },
  {
    name: 'get_exercise_logs',
    description: 'Get all exercise log data for a user\'s specific week. Shows what they actually did — weights, reps, completion status, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        user_name: { type: 'string', description: 'User name: "cody" or "kylie"' },
        week_number: { type: 'number', description: 'Week number' },
      },
      required: ['user_name', 'week_number'],
    },
  },
  {
    name: 'get_progress_summary',
    description: 'Get aggregated progress stats across a range of weeks — completion rates, pain trends, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        user_name: { type: 'string', description: 'User name: "cody" or "kylie"' },
        from_week: { type: 'number', description: 'Start week number' },
        to_week: { type: 'number', description: 'End week number' },
      },
      required: ['user_name', 'from_week', 'to_week'],
    },
  },
  {
    name: 'create_week_plan',
    description: 'Create or replace a full weekly workout plan for a user. Provide all days, sections, and exercises. Each exercise needs an input_config that defines what fields the frontend renders. Use type "weighted_sets" for exercises with weight/reps/feel per set, or type "fields" with a fields array for everything else.',
    inputSchema: {
      type: 'object',
      properties: {
        user_name: { type: 'string', description: 'User name: "cody" or "kylie"' },
        week_number: { type: 'number', description: 'Week number' },
        week_label: { type: 'string', description: 'e.g. "Week 2"' },
        week_subtitle: { type: 'string', description: 'e.g. "Progressive overload · Mar 31 – Apr 6"' },
        days: {
          type: 'array',
          description: 'Array of day objects',
          items: {
            type: 'object',
            properties: {
              day_index: { type: 'number', description: '0=Mon, 1=Tue, ..., 6=Sun' },
              day_label: { type: 'string', description: 'e.g. "Monday"' },
              title: { type: 'string', description: 'e.g. "Lower body + Core"' },
              day_type: { type: 'string', enum: ['strength', 'cardio', 'rest', 'rainier', 'recovery'] },
              duration: { type: 'string', description: 'e.g. "~50-60 min"' },
              is_rest_day: { type: 'boolean' },
              rest_message: { type: 'string' },
              rest_icon: { type: 'string' },
              sections: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'string', description: 'e.g. "Warm-up", "Main work", "Core"' },
                    exercises: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          detail: { type: 'string' },
                          note: { type: 'string' },
                          exercise_type: { type: 'string' },
                          input_config: { type: 'object', description: 'JSON config defining what inputs to render' },
                          is_rainier: { type: 'boolean' },
                        },
                        required: ['name', 'input_config'],
                      },
                    },
                  },
                  required: ['label', 'exercises'],
                },
              },
            },
            required: ['day_index', 'day_label', 'sections'],
          },
        },
      },
      required: ['user_name', 'week_number', 'week_label', 'days'],
    },
  },
  {
    name: 'update_exercise',
    description: 'Update a single exercise\'s properties (name, detail, note, input_config, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        exercise_id: { type: 'string', description: 'UUID of the exercise to update' },
        changes: { type: 'object', description: 'Object of fields to update' },
      },
      required: ['exercise_id', 'changes'],
    },
  },
  {
    name: 'add_exercise',
    description: 'Add a new exercise to an existing section',
    inputSchema: {
      type: 'object',
      properties: {
        section_id: { type: 'string', description: 'UUID of the section to add to' },
        name: { type: 'string' },
        detail: { type: 'string' },
        note: { type: 'string' },
        exercise_type: { type: 'string' },
        input_config: { type: 'object' },
        is_rainier: { type: 'boolean' },
      },
      required: ['section_id', 'name', 'input_config'],
    },
  },
  {
    name: 'remove_exercise',
    description: 'Remove an exercise from the plan',
    inputSchema: {
      type: 'object',
      properties: {
        exercise_id: { type: 'string', description: 'UUID of the exercise to remove' },
      },
      required: ['exercise_id'],
    },
  },
  {
    name: 'update_plan_status',
    description: 'Update a plan\'s status (active, completed, draft)',
    inputSchema: {
      type: 'object',
      properties: {
        plan_id: { type: 'string', description: 'UUID of the plan' },
        status: { type: 'string', enum: ['active', 'completed', 'draft'] },
      },
      required: ['plan_id', 'status'],
    },
  },
];

// Handle MCP JSON-RPC requests
async function handleMCPRequest(request: Request, env: Env): Promise<Response> {
  const body: any = await request.json();
  const { method, params, id } = body;

  const sb = getSupabase(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  // JSON-RPC response helper
  const respond = (result: any) => new Response(JSON.stringify({ jsonrpc: '2.0', id, result }), {
    headers: { 'Content-Type': 'application/json' },
  });

  const respondError = (code: number, message: string) => new Response(JSON.stringify({
    jsonrpc: '2.0', id, error: { code, message },
  }), { headers: { 'Content-Type': 'application/json' } });

  try {
    switch (method) {
      case 'initialize':
        return respond({
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'rainier-tracker', version: '1.0.0' },
        });

      case 'tools/list':
        return respond({ tools: TOOLS });

      case 'tools/call': {
        const toolName = params?.name;
        const args = params?.arguments || {};
        let result: any;

        switch (toolName) {
          case 'get_user_profile':
            result = await getUserProfile(sb, args.user_name);
            break;
          case 'get_current_plan':
            result = await getCurrentPlan(sb, args.user_name, args.week_number);
            break;
          case 'get_exercise_logs':
            result = await getExerciseLogs(sb, args.user_name, args.week_number);
            break;
          case 'get_progress_summary':
            result = await getProgressSummary(sb, args.user_name, args.from_week, args.to_week);
            break;
          case 'create_week_plan':
            result = await createWeekPlan(sb, args.user_name, {
              week_number: args.week_number,
              week_label: args.week_label,
              week_subtitle: args.week_subtitle,
              days: args.days,
            });
            break;
          case 'update_exercise':
            result = await updateExercise(sb, args.exercise_id, args.changes);
            break;
          case 'add_exercise':
            result = await addExercise(sb, args.section_id, {
              name: args.name,
              detail: args.detail,
              note: args.note,
              exercise_type: args.exercise_type,
              input_config: args.input_config,
              is_rainier: args.is_rainier,
            });
            break;
          case 'remove_exercise':
            result = await removeExercise(sb, args.exercise_id);
            break;
          case 'update_plan_status':
            result = await updatePlanStatus(sb, args.plan_id, args.status);
            break;
          default:
            return respondError(-32601, `Unknown tool: ${toolName}`);
        }

        return respond({
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        });
      }

      default:
        return respondError(-32601, `Unknown method: ${method}`);
    }
  } catch (e: any) {
    return respondError(-32000, e.message || 'Internal error');
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS for preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Optional: shared secret auth
    if (env.SHARED_SECRET) {
      const auth = request.headers.get('Authorization');
      if (auth !== `Bearer ${env.SHARED_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    if (request.method === 'POST') {
      const response = await handleMCPRequest(request, env);
      // Add CORS headers
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      return new Response(response.body, { status: response.status, headers });
    }

    // Health check
    return new Response(JSON.stringify({
      name: 'rainier-tracker-mcp',
      version: '1.0.0',
      description: 'MCP server for Rainier Training Tracker — read/write workout plans in Supabase',
      tools: TOOLS.map(t => t.name),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
