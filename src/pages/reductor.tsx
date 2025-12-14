import React from 'react';

export default function Reductor({ children, whiteboardRef }: { children: React.ReactNode; whiteboardRef: React.RefObject<any> }){
	const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (whiteboardRef.current) {
			whiteboardRef.current.setBackgroundColor(e.target.value);
		}
	};
	return(
		<div id="body" style={{display: "grid", gridTemplateColumns: "320px 1fr 320px", height: "100vh"}}>
			<div id="left" style={{gridColumn: "1", display: "grid", gridTemplateRows: "1fr 1fr", borderStyle: "solid", borderColor: "black", borderWidth: "2px"}}>
				<div id="blocks" style={{gridRow: "1", borderBottomStyle: "solid", borderColor: "black", borderWidth: "1px"}}>
					<h3>Figures</h3>
					<table>
						<tr>
							<td>
								<button id="arrowButton">
									I {/* 'Seit j'ab'ut att'els ar fig'uru */}
								</button>
							</td>
							<td>
								<button id="squareButton">
									П {/* 'Seit j'ab'ut att'els ar fig'uru */}
								</button>
							</td>
							<td>
								<button id="circleButton">
									O {/* 'Seit j'ab'ut att'els ar fig'uru */}
								</button>
							</td>
						</tr>
					</table>
				</div>
				<div id="colorChooser" style={{gridRow: "2"}}>
					<h3>Color Palette</h3>
				</div>
			</div>
			<div id="center" style={{gridColumn: "2", height: "100%"}}>
				{children}
			</div>
			<div id="right" style={{gridColumn: "3", borderStyle: "solid", borderColor: "black", borderWidth: "2px", padding: "10px"}}>
				<h3>Tools</h3>
				<div style={{marginBottom: "20px"}}>
					<label style={{display: "block", marginBottom: "8px"}}>Canvas Background:</label>
					<div style={{display: "flex", gap: "10px"}}>
						<input
							type="color"
							defaultValue="#ffffff"
							onChange={handleBackgroundColorChange}
							style={{cursor: "pointer", width: "60px", height: "40px", border: "1px solid #ccc"}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
