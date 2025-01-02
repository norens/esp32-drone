import { useEffect, useState } from "react";
import { socket } from "../scripts/socket.ts";

const NUM_DRONES = 2;

export default function ArmControl() {
	const [droneArmed, setDroneArmed] = useState(Array(NUM_DRONES).fill(false));
	const [currentDroneIndex, setCurrentDroneIndex] = useState(0);

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

	const toggleArm = (droneIndex: number) => {
		const newDroneArmed = [...droneArmed];
		newDroneArmed[droneIndex] = !newDroneArmed[droneIndex];
		setDroneArmed(newDroneArmed);
	};

	return (
		<div>
			<div>
				<label htmlFor="droneSelector">Select Drone: </label>
				<select
					id="droneSelector"
					value={currentDroneIndex}
					onChange={(e) => setCurrentDroneIndex(Number(e.target.value))}
				>
					{Array.from({length: NUM_DRONES}).map((_, droneIndex) => (
						<option key={droneIndex} value={droneIndex}>
							Drone {droneIndex}
						</option>
					))}
				</select>
			</div>
			<div key={currentDroneIndex}>
				<h4>Drone {currentDroneIndex}</h4>
				<button
					onClick={() => toggleArm(currentDroneIndex)}
					style={{backgroundColor: droneArmed[currentDroneIndex] ? "red" : "green"}}
				>
					{droneArmed[currentDroneIndex] ? "Disarm" : "Arm"}
				</button>
			</div>
		</div>
	);
}