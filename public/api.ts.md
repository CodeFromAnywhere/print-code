Make a GET endpoint that takes encoded urls in the path (/{url1}/{url2}/.../{url-n})

1. it fetches all urls text. if no urls are provided, respond early with a text/html of {originUrl}/home.html (fetch it)
2. it puts the text into a printable html, assuming every text is a code block, and using the url as header. the html has a style to support printing nicely and also highlight.js the code blocks. the lang of <code> can be set to the extension of the last chunk of the URL, if any.
3. it streams text/html with the generated html back, adding the HTML head and script first, then stream each created code block individually as they come back.
