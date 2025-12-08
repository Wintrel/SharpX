import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Reductor(){
	return(
		<div id="body" style={{display: "grid", gridTemplateColumns: "192px 1fr 192px"}}>
			<div id="left" style={{gridColumn: "1", display: "grid", gridTemplateRows: "1fr 1fr", borderStyle: "solid", borderColor: "black", borderWidth: "2px"}}>
				<div id="blocks" style={{gridRow: "1", borderBottomStyle: "solid", borderColor: "black", borderWidth: "1px"}}>
					<h3>Figures</h3>

				</div>
				<div id="hierarchy" style={{gridRow: "2", borderTopStyle: "solid", borderColor: "black", borderWidth: "1px"}}>
					<h3>Figure List</h3>
					<ul id="list" style={{listStyleType: "none"}}>

					</ul>
				</div>
			</div>
			<div id="center" style={{gridColumn: "2", borderStyle: "solid", borderColor: "black", borderWidth: "2px"}}>
				<h3>Canvas</h3>
				<canvas id="canvas">

				</canvas>
			</div>
			<div id="right" style={{gridColumn: "3", borderStyle: "solid", borderColor: "black", borderWidth: "2px"}}>
				<h3>Properties</h3>

			</div>
		</div>
	)
}