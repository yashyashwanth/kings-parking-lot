import { Vehicle } from "./common/Vehicle";
import { VehicleType } from "../enums";

export class Bike extends Vehicle {
  constructor({ number, ownerType }: { number: string; ownerType: number }) {
    super(VehicleType.Bike, number, ownerType);
  }
}
