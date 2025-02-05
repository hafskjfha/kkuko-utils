import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./footer";
import Header from "./header";
import Script from 'next/script';


const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "kkuko utils",
	description: "kkuko utils",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head />
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
				<noscript>
					<iframe
						src="https://www.googletagmanager.com/ns.html?id=GTM-MBK4DFC4"
						height="0"
						width="0"
						style={{ display: 'none', visibility: 'hidden' }}></iframe>
				</noscript>
				{//
		// 		<Script
		// 			src="https://www.googletagmanager.com/gtag/js?id=G-7EYGNWC1DL"
		// 			strategy="beforeInteractive"
		// 		/>
		// 		<Script
		// 			id="ga-script"
		// 			strategy="beforeInteractive"
		// 			dangerouslySetInnerHTML={{
		// 				__html: `
        //     window.dataLayer = window.dataLayer || [];
        //     function gtag(){dataLayer.push(arguments);}
        //     gtag('js', new Date());
        //     gtag('config', 'G-7EYGNWC1DL');
        //   `,
		// 			}}
		// 		/>
		// 		{/* End Google Analytics */}
		// 		<Script
		// 			id="gtm-script"
		// 			strategy="beforeInteractive"
		// 			dangerouslySetInnerHTML={{
		// 				__html: `
        //     (function(w, d, s, l, i) {
        //       w[l] = w[l] || [];
        //       w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
        //       var f = d.getElementsByTagName(s)[0],
        //           j = d.createElement(s),
        //           dl = l != 'dataLayer' ? '&l=' + l : '';
        //       j.async = true;
        //       j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        //       f.parentNode.insertBefore(j, f);
        //     })(window, document, 'script', 'dataLayer', 'GTM-MBK4DFC4');
        //   `,
		// 			}}
		// 		/>
		 		}
				<Header />
				{children}
				<Footer />
			</body>
		</html>
	);
}
