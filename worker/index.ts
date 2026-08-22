interface Env {
  ASSETS: Fetcher
  DB: D1Database
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // GET /api/notes
    // Optionally filter notes by record_id:
    // /api/notes?record_id=NPC-006
    if (url.pathname === "/api/notes" && request.method === "GET") {
      const recordId = url.searchParams.get("record_id")

      if (recordId) {
        const result = await env.DB
          .prepare(
            "SELECT id, record_id, author, content, created_at FROM notes WHERE record_id = ? ORDER BY created_at DESC",
          )
          .bind(recordId)
          .all()

        return Response.json(result.results ?? [])
      }

      const result = await env.DB
        .prepare(
          "SELECT id, record_id, author, content, created_at FROM notes ORDER BY created_at DESC",
        )
        .all()

      return Response.json(result.results ?? [])
    }

    // POST /api/notes
    if (url.pathname === "/api/notes" && request.method === "POST") {
      const body = await request.json<{
        record_id?: string
        author?: string
        content?: string
      }>()

      if (!body.record_id || !body.author || !body.content) {
        return Response.json(
          { error: "record_id, author and content are required" },
          { status: 400 },
        )
      }

      const result = await env.DB
        .prepare(
          "INSERT INTO notes (record_id, author, content) VALUES (?, ?, ?)",
        )
        .bind(body.record_id, body.author, body.content)
        .run()

      return Response.json(
        {
          success: true,
          id: result.meta.last_row_id,
        },
        { status: 201 },
      )
    }

    // Everything that isn't /api/... continues to the existing Quartz site.
    return env.ASSETS.fetch(request)
  },
}