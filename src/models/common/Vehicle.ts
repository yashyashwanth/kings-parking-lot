import { VehicleType } from "../../enums";

export interface IVehicle {
  type: number;
  number: string;
  ownerType: number;
}

export abstract class Vehicle implements IVehicle {
  type: number;
  number: string;
  ownerType: number;

  constructor(type: number, number: string, ownerType: number) {
    this.type = type;
    this.number = number;
    this.ownerType = ownerType;
  }

  getDetails(): void {
    console.log(`This ${VehicleType[this.type]} number is ${this.number}`);
  }
}
