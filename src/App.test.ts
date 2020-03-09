import { Garage } from "./models/Garage";
import { IVehicle } from "./models/common/Vehicle";
import { IAllocationDetails, ISlot } from "./Slot";
import { Bike } from "./models/Bike";
import { Car } from "./models/Car";
import { FLOORS } from "./const";
import { VehicleType, OwnerType } from "./enums";

describe("Parking Service", () => {
  it("should allocate normal person in first floor", () => {
    const garage = new Garage(FLOORS);
    const vehicle: IVehicle = {
      type: VehicleType.Bike,
      number: "KA-01",
      ownerType: OwnerType.Normal
    };
    const bike = new Bike(vehicle);

    const allocationDetails: IAllocationDetails = garage.allocateSlot(bike);

    expect(allocationDetails.floor).toBe(1);
  });

  it("should allocate elderly in ground floor", () => {
    const garage = new Garage(FLOORS);
    const vehicle: IVehicle = {
      type: VehicleType.Bike,
      number: "KA-01",
      ownerType: OwnerType.Elderly
    };
    const bike = new Bike(vehicle);

    const allocationDetails: IAllocationDetails = garage.allocateSlot(bike);

    expect(allocationDetails.floor).toBe(0);
  });

  it("should allocate royal person in first floor", () => {
    const garage = new Garage(FLOORS);
    const vehicle: IVehicle = {
      type: VehicleType.Car,
      number: "KA-01",
      ownerType: OwnerType.Royal
    };
    const bike = new Car(vehicle);

    const allocationDetails: IAllocationDetails = garage.allocateSlot(bike);

    expect(allocationDetails.floor).toBe(1);
  });
});
