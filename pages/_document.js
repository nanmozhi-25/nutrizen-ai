import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <meta charSet="UTF-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <script src="https://unpkg.com/lucide@latest"></script>
      </Head>
      <body class="bg-zen-charcoal text-stone-100 min-h-screen flex flex-col font-sans transition-colors duration-300">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
