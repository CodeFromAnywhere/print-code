export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const paths = url.pathname.split("/").filter(Boolean);

  if (paths.length === 0) {
    const homeContent = await fetch(`${url.origin}/home.html`).then((res) =>
      res.text(),
    );
    return new Response(homeContent, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Snippets</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/default.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; }
      pre { page-break-inside: avoid; }
      @media print {
        body { font-size: 12pt; }
        pre { white-space: pre-wrap; }
      }
    </style>
  </head>
  <body>
  <script>hljs.highlightAll();</script>
  `),
      );

      for (const path of paths) {
        try {
          const decodedUrl = decodeURIComponent(path);
          const content = await fetch(decodedUrl).then((res) => res.text());
          const extension = decodedUrl.split(".").pop() || "";

          const htmlContent = `
  <h2>${decodedUrl}</h2>
  <pre><code class="language-${extension}">${content
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</code></pre>
  `;
          controller.enqueue(encoder.encode(htmlContent));
        } catch (error) {
          controller.enqueue(
            encoder.encode(`<p>Error fetching ${path}: ${error.message}</p>`),
          );
        }
      }

      controller.enqueue(encoder.encode("</body></html>"));
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
};
