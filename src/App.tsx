import React, { useState, useEffect, useCallback } from "react";

import { VehicleType, OwnerType } from "./enums";
import { IVehicle } from "./models/common/Vehicle";
import { Bike } from "./models/Bike";
import { Car } from "./models/Car";
import { Garage, IGarage } from "./models/Garage";
import { FLOORS } from "./const";
import { ISlot, IAllocationDetails } from "./models/Slot";

function App() {
  const [vehicle, setVehicle] = useState<IVehicle>({
    type: VehicleType.Bike,
    number: "",
    ownerType: OwnerType.Normal
  });

  const [gates, setGate] = useState({
    current: "in",
    list: [
      { key: "in", name: "IN" },
      { key: "out", name: "OUT" }
    ]
  });
  const [validation, setValidation] = useState({ status: true, msg: "" });
  const [floor, setFloor] = useState(1);
  const [, updateState] = React.useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [garage] = useState<IGarage>(new Garage(FLOORS));

  function radioChangeHandler(key: string) {
    setGate(prevS => {
      return { ...prevS, current: key };
    });
  }

  function inputChangeHandler(key: any, val: any) {
    if (typeof val === "string" || typeof val === "number") {
      setVehicle((prevS: IVehicle) => {
        return { ...prevS, [key]: val };
      });
    }
  }

  function vehicleByType(type: number) {
    switch (type) {
      case VehicleType.Bike:
        return new Bike(vehicle);
      case VehicleType.Car:
        return new Car(vehicle);
      default:
        break;
    }
  }

  function validateInput(e: any) {
    e.preventDefault();
    if (vehicle.number === "") {
      setValidation({ status: false, msg: "Enter Valid Vehicle Number" });
    } else submitHandler(e);
  }

  function submitHandler(e: any) {
    const vehicleObj = vehicleByType(vehicle.type);

    if (vehicleObj && vehicleObj.number !== "") {
      if (gates.current == "in") {
        const allocationDetails: IAllocationDetails = garage.allocateSlot(
          vehicleObj
        );
        if (allocationDetails.allocated) {
          if (!validation.status) setValidation({ status: true, msg: "" });
          setFloor(allocationDetails.floor + 1);
        }
        if (!allocationDetails.allocated)
          setValidation({ status: false, msg: allocationDetails.errorMsg });
      }

      if (gates.current == "out") {
        garage.emptyTheSlot(vehicle.number);
      }
    }

    setVehicle((prevS: IVehicle) => {
      return { ...prevS, number: "" };
    });

    forceUpdate();
  }

  const pagintion = [];
  for (let i = 1; i <= FLOORS; i++) {
    pagintion.push(
      <li
        key={i}
        className={["page-item", i === floor ? "active" : ""].join(" ")}
      >
        <a
          className="page-link"
          href="#"
          onClick={e => {
            e.preventDefault();
            setFloor(i);
          }}
        >
          {i}
        </a>
      </li>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row text-center">
        <div className="col">
          <h1>King's Parking Garage</h1>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <form onSubmit={e => validateInput(e)}>
            <div className="form-group">
              {gates.list.map(radio => (
                <div
                  key={radio.key}
                  className="custom-control custom-radio custom-control-inline"
                >
                  <input
                    type="radio"
                    id={radio.key}
                    name="customRadio"
                    checked={radio.key === gates.current}
                    className="custom-control-input"
                    onChange={() => radioChangeHandler(radio.key)}
                  />
                  <label className="custom-control-label" htmlFor={radio.key}>
                    {radio.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="form-group">
              <label htmlFor="ownerTypeForIn">Vehicle Type</label>
              <select
                className="form-control"
                id="vehicleTypeForIn"
                value={vehicle.type}
                onChange={e =>
                  inputChangeHandler("type", parseInt(e.target.value.trim()))
                }
              >
                <option value={VehicleType.Bike}>Bike</option>
                <option value={VehicleType.Car}>Car</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="vehicleNumberForIn">Vehicle Number</label>
              <input
                type="text"
                className="form-control"
                id="vehicleNumberForIn"
                value={vehicle.number}
                onChange={e =>
                  inputChangeHandler("number", e.target.value.trim())
                }
              />
            </div>
            {gates.current === "in" && (
              <div className="form-group">
                <label htmlFor="ownerTypeForIn">Owner Type</label>
                <select
                  className="form-control"
                  id="ownerTypeForIn"
                  value={vehicle.ownerType}
                  onChange={e =>
                    inputChangeHandler(
                      "ownerType",
                      parseInt(e.target.value.trim())
                    )
                  }
                >
                  <option value={OwnerType.Normal}>Normal</option>
                  <option value={OwnerType.Royal}>Royal</option>
                  <option value={OwnerType.Elderly}>Elderly</option>
                </select>
              </div>
            )}
            {!validation.status && (
              <div className="alert alert-danger" role="alert">
                {validation.msg}
              </div>
            )}
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </div>
      </div>
      <div className="row" style={{ paddingTop: "40px" }}>
        <div className="col">
          <nav aria-label="Page navigation example">
            <ul className="pagination">{pagintion}</ul>
          </nav>
        </div>
      </div>
      <div className="row" style={{ paddingTop: "10px" }}>
        <div className="col">
          <table className="table table-striped table-dark">
            <tbody>
              {console.log(garage, floor)}
              {garage.space[floor - 1].floor.map((row, i) => (
                <tr key={i}>
                  {row.map((slot: ISlot, j) => (
                    <td key={j}>
                      <span>Slot: {i * row.length + j + 1}</span>
                      <br />
                      <span>
                        {VehicleType[slot.vehicleType]
                          ? VehicleType[slot.vehicleType]
                          : slot.blocked
                          ? "Blocked"
                          : "Empty"}
                      </span>
                      <br />
                      <span>Count: {slot.total}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
