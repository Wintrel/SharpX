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
		<div id="body" style={{display: "grid", gridTemplateColumns: "320px 1fr 320px"}}>
			<div id="left" style={{gridColumn: "1", display: "grid", gridTemplateRows: "1fr 1fr", borderStyle: "solid", borderColor: "black", borderWidth: "2px"}}>
				<div id="blocks" style={{gridRow: "1", borderBottomStyle: "solid", borderColor: "black", borderWidth: "1px"}}>
					<h3>Figures</h3>
					<table>
						<tr>
							<td>
								<button id="arrowButton">
									I <!-- 'Seit j'ab'ut att'els ar fig'uru -->
								</button>
							</td>
							<td>
								<button id="squareButton">
									П <!-- 'Seit j'ab'ut att'els ar fig'uru -->
								</button>
							</td>
							<td>
								<button id="circleButton">
									O <!-- 'Seit j'ab'ut att'els ar fig'uru -->
								</button>
							</td>
						</tr>
						<tr>
							<td>
								<button id="treangleButton">
									^ <!-- 'Seit j'ab'ut att'els ar fig'uru -->
								</button>
							</td>
							<td>
								<button id="pentagonButton">
									* <!-- 'Seit j'ab'ut att'els ar fig'uru -->
								</button>
							</td>
							<td>
								<button id="hexagonButton">
									Ж <!-- 'Seit j'ab'ut att'els ar fig'uru -->
								</button>
							</td>
						</tr>
					</table>
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
				<div id="arrowProp" class="prop" style={{display: "none"}}>

				</div>
				<div id="squareProp" class="prop" style={{display: "none"}}>

				</div>
				<div id="treangleProp" class="prop" style={{display: "none"}}>

				</div>
				<div id="pentaProp" class="prop" style={{display: "none"}}>

				</div>
				<div id="hexaProp" class="prop" style={{display: "none"}}>

				</div>
				<div id="circleProp" class="prop" style={{display: "none"}}>

				</div>
			</div>
		</div>
	)
}