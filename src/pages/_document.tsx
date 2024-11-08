import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}


// import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

// class MyDocument extends Document {
//   static async getInitialProps(ctx: DocumentContext) {
//     const initialProps = await Document.getInitialProps(ctx);
//     return { ...initialProps };
//   }

//   render() {
//     return (
//       <Html lang="en">
//         <Head>
//           {/* Google Tag Manager */}
//           <script dangerouslySetInnerHTML={{
//             __html: `
//               (function(w, d, s, l, i) {
//                 w[l] = w[l] || [];
//                 w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
//                 var f = d.getElementsByTagName(s)[0],
//                     j = d.createElement(s),
//                     dl = l != 'dataLayer' ? '&l=' + l : '';
//                 j.async = true;
//                 j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
//                 f.parentNode.insertBefore(j, f);
//               })(window, document, 'script', 'dataLayer', 'GTM-MBK4DFC4');
//             `
//           }} />
//           {/* Google Analytics */}
//           <script async src="https://www.googletagmanager.com/gtag/js?id=G-7EYGNWC1DL"></script>
//           <script dangerouslySetInnerHTML={{
//             __html: `
//               window.dataLayer = window.dataLayer || [];
//               function gtag() { dataLayer.push(arguments); }
//               gtag('js', new Date());
//               gtag('config', 'G-7EYGNWC1DL');
//             `
//           }} />
//           <meta charSet="UTF-8" />
//           <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//           <link rel="icon" href="/img/favicon.ico" type="image/x-icon" />
//           <link rel="stylesheet" href="/styles.css" />
//           <title>끄코 단어 조합기</title>
//         </Head>
//         <body>
//           <noscript>
//             <iframe
//               src="https://www.googletagmanager.com/ns.html?id=GTM-MBK4DFC4"
//               height="0"
//               width="0"
//               style={{ display: 'none', visibility: 'hidden' }}
//             ></iframe>
//           </noscript>
//           <Main />
//           <NextScript />
//         </body>
//       </Html>
//     );
//   }
// }

// export default MyDocument;
