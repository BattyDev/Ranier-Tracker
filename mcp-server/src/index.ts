/**
 * Rainier Training Tracker — Remote MCP Server (Streamable HTTP)
 *
 * Cloudflare Worker implementing the MCP Streamable HTTP transport.
 * Claude Desktop connects via POST with JSON-RPC messages.
 *
 * Deploy: cd mcp-server && npx wrangler deploy
 * Secrets: npx wrangler secret put SUPABASE_SERVICE_KEY
 *          npx wrangler secret put SHARED_SECRET
 */

import { getSupabase, Env } from './supabase';
import { getUserProfile, getCurrentPlan, getExerciseLogs, getProgressSummary } from './tools/read';
import { createWeekPlan, updateExercise, addExercise, removeExercise, updatePlanStatus } from './tools/write';

const PROTOCOL_VERSION = '2025-03-26';

// MCP tool definitions
const TOOLS = [
  {
    name: 'get_user_profile',
    description: 'Get a user\'s profile including goals, constraints, and preferences. Use this to understand who you\'re planning for.',
    inputSchema: {
      type: 'object' as const,
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
      type: 'object' as const,
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
      type: 'object' as const,
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
      type: 'object' as const,
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
      type: 'object' as const,
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
                          description: { type: 'string', description: 'Plain-language explanation of the exercise: what it is, proper form, and why it\'s in the plan. Shown via an info button on the frontend.' },
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
      type: 'object' as const,
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
      type: 'object' as const,
      properties: {
        section_id: { type: 'string', description: 'UUID of the section to add to' },
        name: { type: 'string' },
        detail: { type: 'string' },
        note: { type: 'string' },
        description: { type: 'string', description: 'Plain-language explanation of the exercise' },
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
      type: 'object' as const,
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
      type: 'object' as const,
      properties: {
        plan_id: { type: 'string', description: 'UUID of the plan' },
        status: { type: 'string', enum: ['active', 'completed', 'draft'] },
      },
      required: ['plan_id', 'status'],
    },
  },
];

// Execute a tool call
async function executeTool(env: Env, toolName: string, args: any): Promise<any> {
  const sb = getSupabase(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  switch (toolName) {
    case 'get_user_profile':
      return await getUserProfile(sb, args.user_name);
    case 'get_current_plan':
      return await getCurrentPlan(sb, args.user_name, args.week_number);
    case 'get_exercise_logs':
      return await getExerciseLogs(sb, args.user_name, args.week_number);
    case 'get_progress_summary':
      return await getProgressSummary(sb, args.user_name, args.from_week, args.to_week);
    case 'create_week_plan':
      return await createWeekPlan(sb, args.user_name, {
        week_number: args.week_number,
        week_label: args.week_label,
        week_subtitle: args.week_subtitle,
        days: args.days,
      });
    case 'update_exercise':
      return await updateExercise(sb, args.exercise_id, args.changes);
    case 'add_exercise':
      return await addExercise(sb, args.section_id, {
        name: args.name,
        detail: args.detail,
        note: args.note,
        description: args.description,
        exercise_type: args.exercise_type,
        input_config: args.input_config,
        is_rainier: args.is_rainier,
      });
    case 'remove_exercise':
      return await removeExercise(sb, args.exercise_id);
    case 'update_plan_status':
      return await updatePlanStatus(sb, args.plan_id, args.status);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// Process a single JSON-RPC message, return response or null for notifications
async function processMessage(body: any, env: Env): Promise<any | null> {
  const { method, params, id } = body;

  // Notifications (no id) don't get responses
  const isNotification = id === undefined || id === null;

  try {
    switch (method) {
      case 'initialize':
        if (isNotification) return null;
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: { tools: {} },
            serverInfo: { name: 'rainier-tracker', version: '1.0.0' },
          },
        };

      case 'notifications/initialized':
        return null;

      case 'ping':
        if (isNotification) return null;
        return { jsonrpc: '2.0', id, result: {} };

      case 'tools/list':
        if (isNotification) return null;
        return { jsonrpc: '2.0', id, result: { tools: TOOLS } };

      case 'tools/call': {
        if (isNotification) return null;
        const toolName = params?.name;
        const args = params?.arguments || {};

        try {
          const result = await executeTool(env, toolName, args);
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            },
          };
        } catch (e: any) {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: `Error: ${e.message}` }],
              isError: true,
            },
          };
        }
      }

      default:
        if (isNotification) return null;
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Unknown method: ${method}` },
        };
    }
  } catch (e: any) {
    if (isNotification) return null;
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32000, message: e.message || 'Internal error' },
    };
  }
}

// CORS headers shared across all responses
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id, Accept',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
};

// Generate a simple session ID
function generateSessionId(): string {
  return crypto.randomUUID();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // Auth check
    if (env.SHARED_SECRET) {
      const auth = request.headers.get('Authorization');
      if (auth !== `Bearer ${env.SHARED_SECRET}`) {
        return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });
      }
    }

    // GET — SSE endpoint or health check
    if (request.method === 'GET') {
      const accept = request.headers.get('Accept') || '';
      if (accept.includes('text/event-stream')) {
        // Open an SSE stream that stays alive with periodic pings.
        // mcp-remote expects this to remain open for the session lifetime.
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            // Send initial comment to establish connection
            controller.enqueue(encoder.encode(': connected\n\n'));
          },
          pull(controller) {
            // Keep-alive: send a ping comment every time the stream is pulled
            // Cloudflare Workers will keep the stream open as long as we don't close it
          },
          cancel() {
            // Client disconnected
          },
        });

        return new Response(stream, {
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Mcp-Session-Id': generateSessionId(),
          },
        });
      }

      // Health check (non-SSE GET)
      return new Response(JSON.stringify({
        name: 'rainier-tracker-mcp',
        version: '1.0.0',
        description: 'MCP server for Rainier Training Tracker',
        tools: TOOLS.map(t => t.name),
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // DELETE — session cleanup
    if (request.method === 'DELETE') {
      return new Response(null, { status: 200, headers: CORS_HEADERS });
    }

    // POST — main MCP message handler
    if (request.method === 'POST') {
      let body: any;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({
          jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' },
        }), { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
      }

      // Check what the client accepts
      const accept = request.headers.get('Accept') || 'application/json';
      const wantsSSE = accept.includes('text/event-stream');

      // Handle batch requests
      if (Array.isArray(body)) {
        const results = await Promise.all(body.map((msg: any) => processMessage(msg, env)));
        const responses = results.filter((r: any) => r !== null);

        if (responses.length === 0) {
          return new Response(null, { status: 202, headers: CORS_HEADERS });
        }

        if (wantsSSE) {
          const encoder = new TextEncoder();
          const sseBody = responses
            .map((r: any) => `event: message\ndata: ${JSON.stringify(r)}\n\n`)
            .join('');
          return new Response(encoder.encode(sseBody), {
            headers: {
              ...CORS_HEADERS,
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Mcp-Session-Id': request.headers.get('Mcp-Session-Id') || generateSessionId(),
            },
          });
        }

        return new Response(JSON.stringify(responses), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      // Single message
      const result = await processMessage(body, env);

      // Notification — no response body
      if (result === null) {
        return new Response(null, {
          status: 202,
          headers: {
            ...CORS_HEADERS,
            'Mcp-Session-Id': request.headers.get('Mcp-Session-Id') || generateSessionId(),
          },
        });
      }

      // Check if this is the initialize response — assign a session ID
      const sessionId = request.headers.get('Mcp-Session-Id') || generateSessionId();

      if (wantsSSE) {
        // Return as SSE event
        const sseBody = `event: message\ndata: ${JSON.stringify(result)}\n\n`;
        return new Response(new TextEncoder().encode(sseBody), {
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Mcp-Session-Id': sessionId,
          },
        });
      }

      return new Response(JSON.stringify(result), {
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
          'Mcp-Session-Id': sessionId,
        },
      });
    }

    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  },
};
