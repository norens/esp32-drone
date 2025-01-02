import { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { socket } from "../scripts/socket.ts";

const NUM_DRONES = 2;

export default function ArmControl() {
	const [droneArmed, setDroneArmed] = useState(Array(NUM_DRONES).fill(false));
	const [currentDroneIndex, setCurrentDroneIndex] = useState(1);
	const [dronePID, setDronePID] = useState(["1", "0", "0", "1.5", "0", "0", "0.3", "0.1", "0.05", "0.2", "0.03", "0.05", "0.3", "0.1", "0.05", "28", "-0.035"]);
	const [droneSetpoint, setDroneSetpoint] = useState([...Array(NUM_DRONES)].map(() => (["0", "0", "0"])));
	const [droneTrim, setDroneTrim] = useState(["0", "74", "-800", "0"]);
	const [manualMode, setManualMode] = useState(false);

	useEffect(() => {
		let count = 0;
		socket.emit("arm-drone", {droneArmed, count, currentDroneIndex});
		const pingInterval = setInterval(() => {
			count += 1;
			socket.emit("arm-drone", {droneArmed, count, currentDroneIndex});
		}, 500);

		return () => {
			clearInterval(pingInterval);
		};
	}, [droneArmed, currentDroneIndex]);

	useEffect(() => {
		let count = 0;
		socket.emit("arm-drone", {droneArmed, count, currentDroneIndex});
		const pingInterval = setInterval(() => {
			count += 1;
			socket.emit("arm-drone", {droneArmed, count, currentDroneIndex});
		}, 500);

		return () => {
			clearInterval(pingInterval);
		};
	}, [currentDroneIndex, droneArmed]);

	useEffect(() => {
		for (let droneIndex = 0; droneIndex < NUM_DRONES; droneIndex++) {
			socket.emit("set-drone-pid", {dronePID, droneIndex});
		}
	}, [dronePID]);

	useEffect(() => {
		socket.emit("set-drone-trim", {droneTrim, droneIndex: currentDroneIndex});
	}, [currentDroneIndex, droneTrim]);

	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		if (!manualMode) return;

		const newDroneTrim = [...droneTrim];
		if (event.key === "ArrowDown") {
			newDroneTrim[1] = Math.min(800, parseInt(newDroneTrim[1]) + 10).toString();
		} else if (event.key === "ArrowUp") {
			newDroneTrim[1] = Math.max(-800, parseInt(newDroneTrim[1]) - 10).toString();
		} else if (event.key === "ArrowLeft") {
			newDroneTrim[0] = Math.max(-800, parseInt(newDroneTrim[0]) - 10).toString();
		} else if (event.key === "ArrowRight") {
			newDroneTrim[0] = Math.min(800, parseInt(newDroneTrim[0]) + 10).toString();
		} else if (event.key === "s") {
			newDroneTrim[2] = Math.max(-800, parseInt(newDroneTrim[2]) - 10).toString();
		} else if (event.key === "w") {
			newDroneTrim[2] = Math.min(800, parseInt(newDroneTrim[2]) + 10).toString();
		} else if (event.key === "d") {
			newDroneTrim[3] = Math.min(800, parseInt(newDroneTrim[3]) + 10).toString();
		} else if (event.key === "a") {
			newDroneTrim[3] = Math.max(-800, parseInt(newDroneTrim[3]) - 10).toString();
		} else if (event.key === " ") {
			setDroneArmed(droneArmed.map(() => !droneArmed[currentDroneIndex]));
		}

		setDroneTrim(newDroneTrim);
	}, [currentDroneIndex, droneArmed, droneTrim, manualMode]);

	const handleKeyUp = useCallback((event: KeyboardEvent) => {
		if (!manualMode) return;

		const newDroneTrim = [...droneTrim];
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			newDroneTrim[1] = "74";
		} else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
			newDroneTrim[0] = "0";
		} else if (event.key === "a" || event.key === "d") {
			newDroneTrim[3] = "0";
		}

		setDroneTrim(newDroneTrim);
	}, [droneTrim, manualMode]);

	useEffect(() => {
		if (manualMode) {
			window.addEventListener("keydown", handleKeyDown);
			window.addEventListener("keyup", handleKeyUp);
		} else {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		}

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [manualMode, droneTrim, handleKeyDown, handleKeyUp]);

	const handleManualModeChange = useCallback(() => {
		setManualMode(!manualMode);
	}, [manualMode]);

	return (
		<Container fluid>
			<Row className="mt-3 mb-3 flex-nowrap" style={{alignItems: "center"}}>
				<Col className="ms-4" style={{width: "fit-content"}} md="auto">
					<h2>Esp32 Drone control</h2>
				</Col>
			</Row>
			<Row>
				<Col xs={12} md={6}>
					<Card className="shadow-sm p-3 h-100">
						<Row>
							<Col xs="auto">
								<h4>Control Drone</h4>
							</Col>
							<Col xs="3">
								<select value={currentDroneIndex}
								        onChange={(e) => setCurrentDroneIndex(parseInt(e.target.value))}>
									<option value="0">Drone 0</option>
									<option value="1">Drone 1</option>
								</select>
							</Col>
						</Row>
						{Array.from(Array(NUM_DRONES).keys()).map((droneIndex) => (
							droneIndex !== currentDroneIndex ? null : (
								<>
									<Row className="pt-4">
										<Col xs="3">
											<h5>Drone {droneIndex}</h5>
										</Col>
										<Col className="text-center">
											X
										</Col>
										<Col className="text-center">
											Y
										</Col>
										<Col className="text-center">
											Z
										</Col>
									</Row>
									<Row>
										<Col className="pt-2">
											Setpoint
										</Col>
										<Col>
											<Form.Control
												value={droneSetpoint[droneIndex][0]}
												onChange={(event) => {
													const newDroneSetpoint = droneSetpoint.slice();
													newDroneSetpoint[droneIndex][0] = event.target.value;
													setDroneSetpoint(newDroneSetpoint);
												}}
											/>
										</Col>
										<Col>
											<Form.Control
												value={droneSetpoint[droneIndex][1]}
												onChange={(event) => {
													const newDroneSetpoint = droneSetpoint.slice();
													newDroneSetpoint[droneIndex][1] = event.target.value;
													setDroneSetpoint(newDroneSetpoint);
												}}
											/>
										</Col>
										<Col>
											<Form.Control
												value={droneSetpoint[droneIndex][2]}
												onChange={(event) => {
													const newDroneSetpoint = droneSetpoint.slice();
													newDroneSetpoint[droneIndex][2] = event.target.value;
													setDroneSetpoint(newDroneSetpoint);
												}}
											/>
										</Col>
									</Row>
									<Row className="pt-3">
										<Col>
											<Button
												size="sm"
												variant={droneArmed[droneIndex] ? "outline-danger" : "outline-primary"}
												onClick={() => {
													const newDroneArmed = droneArmed.slice();
													newDroneArmed[droneIndex] = !newDroneArmed[droneIndex];
													setDroneArmed(newDroneArmed);
												}
												}>
												{droneArmed[droneIndex] ? "Disarm" : "Arm"}
											</Button>
										</Col>
									</Row>
								</>
							)
						))}
						<Row className="pt-3">
							<Col xs={{offset: 2}} className="text-center">
								Pos P
							</Col>
							<Col className="text-center">
								Pos I
							</Col>
							<Col className="text-center">
								Pos D
							</Col>
						</Row>
						<Row className="pt-2">
							<Col xs={2} className="pt-2 text-end">
								XY
							</Col>
							<Col>
								<Form.Control
									value={dronePID[0]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[0] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
							<Col>
								<Form.Control
									value={dronePID[1]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[1] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
							<Col>
								<Form.Control
									value={dronePID[2]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[2] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
						</Row>
						<Row className="pt-3">
							<Col xs={2} className="pt-2 text-end">
								Z
							</Col>
							<Col>
								<Form.Control
									value={dronePID[3]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[3] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
							<Col>
								<Form.Control
									value={dronePID[4]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[4] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
							<Col>
								<Form.Control
									value={dronePID[5]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[5] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
						</Row>
						<Row className="pt-3">
							<Col xs={2} className="pt-2 text-end">
								YAW
							</Col>
							<Col>
								<Form.Control
									value={dronePID[6]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[6] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
							<Col>
								<Form.Control
									value={dronePID[7]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[7] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
							<Col>
								<Form.Control
									value={dronePID[8]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[8] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
						</Row>
						<Row className="pt-3">
							<Col xs={{offset: 2}} className="text-center">
								Vel P
							</Col>
							<Col className="text-center">
								Vel I
							</Col>
							<Col className="text-center">
								Vel D
							</Col>
						</Row>
						<Row className="pt-2">
							<Col xs={2} className="pt-2 text-end">
								XY
							</Col>
							<Col>
								<Form.Control
									value={dronePID[9]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[9] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
							<Col>
								<Form.Control
									value={dronePID[10]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[10] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
							<Col>
								<Form.Control
									value={dronePID[11]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[11] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
						</Row>
						<Row className="pt-3">
							<Col xs={2} className="pt-2 text-end">
								Z
							</Col>
							<Col>
								<Form.Control
									value={dronePID[12]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[12] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
							<Col>
								<Form.Control
									value={dronePID[13]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[13] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
							<Col>
								<Form.Control
									value={dronePID[14]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[14] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
						</Row>
						<Row>
							<Col>
								<Row className="mt-3 mb-1">
									<Col xs={4}>
										<Form.Label>X Trim: {droneTrim[0]}</Form.Label>
									</Col>
									<Col>
										<Form.Range value={droneTrim[0]} min={-800} max={800} onChange={(event) => {
											const newDroneTrim = droneTrim.slice();
											newDroneTrim[0] = event.target.value;
											setDroneTrim(newDroneTrim);
										}}/>
									</Col>
								</Row>
								<Row className="mb-1">
									<Col xs={4}>
										<Form.Label>Y Trim: {droneTrim[1]}</Form.Label>
									</Col>
									<Col>
										<Form.Range value={droneTrim[1]} min={-800} max={800} onChange={(event) => {
											const newDroneTrim = droneTrim.slice();
											newDroneTrim[1] = event.target.value;
											setDroneTrim(newDroneTrim);
										}}/>
									</Col>
								</Row>
								<Row className="mb-1">
									<Col xs={4}>
										<Form.Label>Z Trim: {droneTrim[2]}</Form.Label>
									</Col>
									<Col>
										<Form.Range value={droneTrim[2]} min={-800} max={800} onChange={(event) => {
											const newDroneTrim = droneTrim.slice();
											newDroneTrim[2] = event.target.value;
											setDroneTrim(newDroneTrim);
										}}/>
									</Col>
								</Row>
								<Row className="mb-1">
									<Col xs={4}>
										<Form.Label>Yaw Trim: {droneTrim[3]}</Form.Label>
									</Col>
									<Col>
										<Form.Range value={droneTrim[3]} min={-800} max={800} onChange={(event) => {
											const newDroneTrim = droneTrim.slice();
											newDroneTrim[3] = event.target.value;
											setDroneTrim(newDroneTrim);
										}}/>
									</Col>
								</Row>
							</Col>
						</Row>
						<Row className="pt-3">
							<Col className="pt-2">
								Ground Effect Coef.
							</Col>
							<Col>
								<Form.Control
									value={dronePID[15]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[15] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
							<Col className="pt-2">
								Ground Effect Offset
							</Col>
							<Col>
								<Form.Control
									value={dronePID[16]}
									onChange={(event) => {
										const newDronePID = dronePID.slice();
										newDronePID[16] = event.target.value;
										setDronePID(newDronePID);
									}}
								/>
							</Col>
						</Row>
						<Row className="pt-3">
							<Col>
								<Button
									variant={manualMode ? "outline-danger" : "outline-primary"}
									onClick={handleManualModeChange}
									onKeyDown={e => e.preventDefault()}
								>
									{manualMode ? "Exit Manual Mode" : "Enter Manual Mode"}
								</Button>
							</Col>
						</Row>
					</Card>
				</Col>
			</Row>
		</Container>
	);
}
