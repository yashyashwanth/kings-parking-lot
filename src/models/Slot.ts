import { SlotCapacity, VehicleType } from "../enums";

export interface IAllocationDetails {
  floor: number;
  row: number;
  number: number;
  allocated: boolean;
  errorMsg: string;
}

export interface ISlot {
  floor: number;
  row: number;
  number: number;
  capacity: number;
  total: number;
  occupied: boolean;
  blocked: boolean;
  royal: boolean;
  vehicleType: number;
  isFull(): boolean;
  accomodate(vehicleType: number, royal?: boolean): IAllocationDetails;
  block(): void;
  unblock(): void;
  emptyTheSlot(): void;
  setCapacity(num: number): void;
  selectSlotCapacity(vType: number): number;
}

export class Slot implements ISlot {
  floor: number;
  row: number;
  number: number;
  capacity: number;
  total: number;
  occupied: boolean;
  blocked: boolean;
  royal: boolean;
  vehicleType: number;

  constructor(floor: number, row: number, number: number) {
    this.floor = floor;
    this.row = row;
    this.number = number;
    this.capacity = 0;
    this.total = 0;
    this.occupied = false;
    this.blocked = false;
    this.vehicleType = 0;
    this.royal = false;
  }

  isFull() {
    return this.occupied && this.total === this.capacity;
  }

  selectSlotCapacity(vType: number) {
    switch (vType) {
      case VehicleType.Bike:
        return SlotCapacity.Bike;
      case VehicleType.Car:
        return SlotCapacity.Car;
      default:
        return SlotCapacity.Bike;
    }
  }

  block() {
    this.blocked = true;
  }

  unblock() {
    if (this.blocked) this.blocked = false;
  }

  emptyTheSlot() {
    this.total--;
    if (this.total === 0) {
      this.vehicleType = 0;
      this.occupied = false;
      this.capacity = 0;
    }
  }

  accomodate(vehicleType: number, royal?: boolean) {
    const details: IAllocationDetails = {
      floor: this.floor,
      row: this.row,
      number: this.number,
      allocated: true,
      errorMsg: ""
    };
    if (!this.vehicleType) this.vehicleType = vehicleType;

    if (!this.capacity) this.setCapacity(this.selectSlotCapacity(vehicleType));
    if (!this.occupied) this.occupied = true;
    if (royal) {
      this.capacity = 1;
      this.royal = true;
    }

    if (this.total < this.capacity) this.total++;

    details.floor = this.floor;

    return details;
  }

  setCapacity(num: number) {
    this.capacity = num;
  }
}
