import { Pipe, PipeTransform } from '@angular/core';

export interface GroupedItem {
  name: string;
  items: any[];
}

@Pipe({
  name: 'groupBy',
})
export class GroupByPipe implements PipeTransform {
  transform(items: any[], getGroupName?: (item: any) => string): GroupedItem[] {
    if (!items) {
      return null;
    }
    if (!getGroupName) {
      return items;
    }

    const groupsMap = new Map<string, any[]>();

    items.forEach((item: any) => {
      const itemGroup = getGroupName(item);
      const groupItems = groupsMap.get(itemGroup);

      if (groupItems) {
        groupItems.push(item);
      } else {
        groupsMap.set(itemGroup, [item]);
      }
    });

    return Array.from(groupsMap)
      .sort(([name], [otherName]) => name.localeCompare(otherName))
      .map(([name, items]) => {
        return { name, items };
      });
  }
}
