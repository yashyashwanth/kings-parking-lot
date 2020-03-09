import { IFloor, Floor } from "./floor";

import { IAllocationDetails, ISlot } from "./Slot";
import { DIMENSIONS, FLOORS } from "../const";
import { OwnerType } from "../enums";

export interface IGarage {
  space: IFloor[];
  allocateSlot(vehicle: any): IAllocationDetails;
  emptyTheSlot(number: string): void;
}

export class Garage {
  space: IFloor[];
  vehicles = new Map<string, IAllocationDetails>();

  constructor(floors: number) {
    this.space = [];

    for (let i = 0; i < floors; i++) {
      this.space[i] = new Floor(i, DIMENSIONS.width, DIMENSIONS.height);
    }
  }

  allocateSlot(vehicle: any) {
    let level = 0;
    let details: IAllocationDetails = {
      floor: 0,
      row: 0,
      number: 0,
      allocated: true,
      errorMsg: ""
    };

    if (this.vehicles.has(vehicle.number)) {
      details.allocated = false;
      details.errorMsg = "Vehicle already Exits!";
      return details;
    }

    switch (vehicle.ownerType) {
      case OwnerType.Elderly:
      case OwnerType.Normal:
        level = vehicle.ownerType === OwnerType.Elderly ? 0 : 1;
        let floorsChecked = false;

        while (level < FLOORS) {
          let floor = this.space[level];

          if (floor.isSlotAvailable(vehicle.type)) {
            const allocationDetails: IAllocationDetails = floor.allocateNormalSlot(
              vehicle
            );
            this.vehicles.set(vehicle.number.toLowerCase(), allocationDetails);
            details = allocationDetails;
            if (floorsChecked && (level === 0 || level === FLOORS - 1)) {
              allocationDetails.allocated = false;
              allocationDetails.errorMsg = "No Slots Available";
            }
            break;
          }

          if (!floorsChecked) floorsChecked = true;

          if (level === FLOORS - 1 && vehicle.ownerType !== OwnerType.Elderly)
            level = 0;
          else level++;
        }
        break;
      case OwnerType.Royal:
        level = 1;

        while (level < FLOORS) {
          let floor = this.space[level];
          let floorsChecked = false;

          if (floor.isRoyalSlotAvailable(vehicle.type)) {
            const allocationDetails: IAllocationDetails = floor.allocateRoyalSlot(
              vehicle
            );
            this.vehicles.set(vehicle.number.toLowerCase(), allocationDetails);
            details = allocationDetails;
            if (floorsChecked && (level === 0 || level === FLOORS - 1)) {
              allocationDetails.allocated = false;
              allocationDetails.errorMsg = "No Slots Available";
            }
            break;
          }

          if (!floorsChecked) floorsChecked = true;

          if (level === FLOORS - 1 && vehicle.ownerType !== OwnerType.Elderly)
            level = 0;
          else level++;
        }
        break;
      default:
        break;
    }

    return details;
  }

  unblockSlots(floor: ISlot[][], rowIndex: number, slotIndex: number) {
    const checkList: ISlot[] = [];
    const row: ISlot[] = floor[rowIndex];

    switch (slotIndex) {
      case 0:
        checkList.push(row[slotIndex + 1]);
        if (rowIndex > 0 && rowIndex < DIMENSIONS.height - 1) {
          if (rowIndex % 2 !== 0) {
            const nextRowIndex = rowIndex + 1;
            const nextRow = floor[nextRowIndex];

            checkList.push(nextRow[slotIndex]);
            checkList.push(nextRow[slotIndex + 1]);
          }
        }
        break;
      case DIMENSIONS.width - 1:
        checkList.push(row[slotIndex - 1]);
        if (rowIndex > 0 && rowIndex < DIMENSIONS.height - 1) {
          if (rowIndex % 2 !== 0) {
            const nextRowIndex = rowIndex + 1;
            const nextRow = floor[nextRowIndex];

            checkList.push(nextRow[slotIndex]);
            checkList.push(nextRow[slotIndex - 1]);
          }
        }
        break;
      default:
        checkList.push(row[slotIndex - 1]);
        checkList.push(row[slotIndex + 1]);
        if (rowIndex > 0 && rowIndex < DIMENSIONS.height - 1) {
          const nextRowIndex = rowIndex + 1;
          const nextRow = floor[nextRowIndex];

          checkList.push(nextRow[slotIndex - 1]);
          checkList.push(nextRow[slotIndex]);
          checkList.push(nextRow[slotIndex + 1]);
        }
        break;
    }

    for (let i = 0; i < checkList.length; i++) {
      const slot: ISlot = checkList[i];
      slot.unblock();
    }
  }

  emptyTheSlot(number: string) {
    if (this.vehicles.has(number.toLowerCase())) {
      const allocationDetails:
        | IAllocationDetails
        | undefined = this.vehicles.get(number.toLowerCase());
      if (allocationDetails) {
        const rowIndex = allocationDetails.row - 1;
        const slotIndex =
          allocationDetails.number -
          (allocationDetails.row - 1) * DIMENSIONS.width -
          1;
        const slot: ISlot = this.space[allocationDetails.floor].floor[rowIndex][
          slotIndex
        ];

        if (slot.royal) {
          this.unblockSlots(
            this.space[allocationDetails.floor].floor,
            rowIndex,
            slotIndex
          );
        }

        slot.emptyTheSlot();
        this.vehicles.delete(number.toLowerCase());
      }
    }
  }
}
