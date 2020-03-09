import { ISlot, Slot, IAllocationDetails } from "./Slot";
import { VehicleType } from "../enums";
import { DIMENSIONS } from "../const";

export interface IFloor {
  floor: ISlot[][];
  showFloor(): void;
  isSlotAvailable(type: number): boolean;
  isRoyalSlotAvailable(type: number): boolean;
  allocateNormalSlot(vehicle: any): IAllocationDetails;
  allocateRoyalSlot(vehicle: any): IAllocationDetails;
}

export class Floor {
  floor: ISlot[][];

  constructor(floor: number, width: number, height: number) {
    this.floor = [];

    for (let i: number = 0; i < height; i++) {
      this.floor[i] = [];
      for (let j: number = 0; j < width; j++) {
        this.floor[i][j] = new Slot(floor, i + 1, i * width + j + 1);
      }
    }
  }

  isSlotAvailable(type: number) {
    let available = false;

    for (let i: number = 0; i < DIMENSIONS.height; i++) {
      const row = this.floor[i];

      for (let j: number = 0; j < DIMENSIONS.width; j++) {
        const slot = row[j];

        if (
          (slot.vehicleType === 0 || slot.vehicleType === type) &&
          (!slot.isFull() || slot.blocked)
        ) {
          available = true;
        }
      }
    }

    return available;
  }

  isRoyalSlotAvailable(type: number) {
    const occupiedCount = this.floor.map(
      row => row.filter(slot => slot.occupied).length
    );
    // console.log("Occupied Count: " + occupiedCount);

    const possibleRows: number[] = [];
    for (let i = 0; i < occupiedCount.length; i++) {
      if (DIMENSIONS.width - occupiedCount[i] >= 3) {
        if (i === 0 || i === occupiedCount.length - 1) possibleRows.push(i);
        else if (i % 2 !== 0 && DIMENSIONS.width - occupiedCount[i + 1] >= 3)
          possibleRows.push(i);
        else if (i % 2 === 0 && DIMENSIONS.width - occupiedCount[i - 1] >= 3)
          possibleRows.push(i);
      }
    }

    return possibleRows.length > 0;
  }

  allocateNormalSlot(vehicle: any) {
    let allocationDetails: any = null;
    const occupiedSlots: number[] = this.floor.map(
      (row: ISlot[]) =>
        row.filter(
          (slot: ISlot) =>
            slot.blocked ||
            slot.isFull() ||
            (slot.occupied && slot.vehicleType !== vehicle.type)
        ).length
    );
    const selectRowIndex: number = occupiedSlots.indexOf(
      Math.min(...occupiedSlots)
    );
    const selectRow: ISlot[] = this.floor[selectRowIndex];

    for (let i = 0; i < selectRow.length; i++) {
      const slot: ISlot = selectRow[i];
      if (!slot.blocked && !slot.isFull()) {
        if (slot.vehicleType !== 0 && slot.vehicleType !== vehicle.type)
          continue;
        allocationDetails = slot.accomodate(vehicle.type);
        break;
      }
    }

    return allocationDetails;
  }

  checkOccupancies(list: ISlot[]) {
    return list.filter(vehicle => vehicle.occupied).length === 0;
  }

  blockOccupancies(list: ISlot[]) {
    list.forEach(slot => slot.block());
  }

  allocateRoyalSlot(vehicle: any) {
    let allocationDetails: any = null;
    const occupiedCount = this.floor.map(
      row => row.filter(slot => slot.occupied).length
    );

    const possibleRows: number[] = [];
    for (let i = 0; i < occupiedCount.length; i++) {
      if (DIMENSIONS.width - occupiedCount[i] >= 3) {
        if (i === 0 || i === occupiedCount.length - 1) possibleRows.push(i);
        else if (i % 2 !== 0 && DIMENSIONS.width - occupiedCount[i + 1] >= 3)
          possibleRows.push(i);
        else if (i % 2 === 0 && DIMENSIONS.width - occupiedCount[i - 1] >= 3)
          possibleRows.push(i);
      }
    }

    if (
      possibleRows.length === 1 &&
      possibleRows[0] > 0 &&
      possibleRows[0] < DIMENSIONS.height - 1
    ) {
      allocationDetails.allocated = false;
      allocationDetails.errorMsg = "No Slots Available";
    }

    let abort: boolean = false;
    for (let i = 0; i < possibleRows.length; i++) {
      const rowIndex = possibleRows[i];
      const row = this.floor[rowIndex];

      if (abort) break;

      for (let j = 0; j < row.length - 1; j++) {
        const currentSlot = row[j];

        if (!currentSlot.occupied) {
          let selectedSlot: ISlot = currentSlot;
          const checkList: ISlot[] = [];

          switch (j) {
            case 0:
              checkList.push(row[j + 1]);
              if (rowIndex > 0 && rowIndex < DIMENSIONS.height - 1) {
                if (rowIndex % 2 !== 0) {
                  const nextRowIndex = possibleRows[i + 1];
                  const nextRow = this.floor[nextRowIndex];

                  checkList.push(nextRow[j]);
                  checkList.push(nextRow[j + 1]);
                }
              }
              break;
            case row.length - 2:
              selectedSlot = row[j + 1];
              checkList.push(row[j + 1]);
              if (rowIndex > 0 && rowIndex < DIMENSIONS.height - 1) {
                if (rowIndex % 2 !== 0) {
                  const nextRowIndex = possibleRows[i + 1];
                  const nextRow = this.floor[nextRowIndex];

                  checkList.push(nextRow[j]);
                  checkList.push(nextRow[j + 1]);
                }
              }
              break;
            default:
              selectedSlot = row[j + 1];
              checkList.push(row[j]);
              checkList.push(row[j + 2]);
              if (rowIndex > 0 && rowIndex < DIMENSIONS.height - 1) {
                const nextRowIndex = possibleRows[i + 1];
                const nextRow = this.floor[nextRowIndex];

                checkList.push(nextRow[j]);
                checkList.push(nextRow[j + 1]);
                checkList.push(nextRow[j + 2]);
              }
              break;
          }

          if (this.checkOccupancies(checkList) && !selectedSlot.isFull()) {
            allocationDetails = selectedSlot.accomodate(vehicle.type, true);
            this.blockOccupancies(checkList);
            abort = true;
            break;
          }
        }
      }
    }

    // this.showFloor();
    return allocationDetails;
  }

  showFloor() {
    let output = "[\n";
    for (let i = 0; i < this.floor.length; i++) {
      var row = this.floor[i];
      for (let j = 0; j < row.length; j++) {
        output =
          output +
          "Slot " +
          (i * row.length + j + 1) +
          ": " +
          row[j].occupied +
          " " +
          (row[j].vehicleType
            ? VehicleType[row[j].vehicleType][0]
            : row[j].occupied
            ? "X"
            : "E") +
          " " +
          row[j].total +
          ", ";
      }
      output = output + "\n";
      if (i % 2 === 0) output = output + "========\n";
    }
    output = output + "]";

    console.log(output);
  }
}
