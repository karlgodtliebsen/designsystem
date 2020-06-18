import {
  Component,
  ContentChild,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  OnChanges,
  Output,
  TemplateRef,
  ViewChild,
  TrackByFunction,
  ContentChildren,
  AfterViewInit,
} from '@angular/core';

import {
  ListFlexItemDirective,
  ListFooterDirective,
  ListHeaderDirective,
  ListItemDirective,
  ListSectionHeaderDirective,
  ListItemTemplateDirective,
} from './list.directive';
import { LoadOnDemandEvent, LoadOnDemandEventData } from './list.event';
import { ListHelper } from './helpers/list-helper';
import { GroupByPipe, GroupedItem } from './pipes/group-by.pipe';
import { ListSwipeAction } from './list-swipe-action';
import { ThemeColor } from '../../helpers/theme-color.type';
import { ItemComponent } from '../item/item.component';
import { DesignTokenHelper } from '../../helpers/design-token-helper';

export type ListShape = 'square' | 'rounded' | 'none';

@Component({
  selector: 'kirby-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  providers: [ListHelper, GroupByPipe],
})
export class ListComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('list', { static: true }) list: any;

  /**
   * Provide items for the list to render. Items must be provided in the order you expect them to be rendered.
   */

  @Input()
  items: any[];
  sortedItems: any[];

  @Input()
  getItemColor: (item: any) => ThemeColor;

  /**
   * Callback to determine name of section. Sections will be ordered alphabetically.
   */
  @Input() getSectionName: (item: any) => string;

  /**
   * Callback that defines how to track changes for items in the iterable.
   */
  @Input() trackBy: TrackByFunction<any>;

  /**
   * Text to display when no more items can be loaded (used for "on demand"-loading).
   */
  @Input() noMoreItemsText: string;

  /**
   * Determines if virtual scroll is enabled
   * NOTE: This comes with the following limitations:
   * - You can't have both a list header/footer and a section header/footer at the same time
   */
  @Input() isVirtualScrollEnabled = false;

  /**
   * Determines if dividers should be shown or not.
   */
  @Input() showDivider = false;

  /**
   * Determines if list row text should turn bold on selection
   */
  @Input() markSelectedRow = false;

  @HostBinding('class.kirby-list') true;
  /**
   * Determine outline shape of:
   * - list, if {@link #isSectionsEnabled} is `false`
   * - section, if {@link #isSectionsEnabled} is `true`
   *
   * `square` means **without** rounded corners, `rounded` means **with** rounded corners.,  `none` means **without** padding, border, box-shadow and background.
   */
  @Input() shape: ListShape = 'rounded';
  @HostBinding('class.shape-rounded')
  public get isShapeRounded(): boolean {
    return this.shape === 'rounded';
  }
  @HostBinding('class.shape-none')
  public get isShapeNone(): boolean {
    return this.shape === 'none';
  }

  @HostBinding('class.item-spacing')
  @Input()
  hasItemSpacing: boolean;

  @Input() itemHeightFn: (item: any, index: number) => number = this.kirbyItemHeightFn.bind(this);

  /**
   * Determines if list items should have swipe actions or not
   * - the order of swipe actions is used to determine edge actions,
   * as well as their order of appearance on the screen.
   */
  @Input() swipeActions: ListSwipeAction[] = [];

  /**
   * Emitting event when more items are to be loaded.
   */
  @Output() loadOnDemand = new EventEmitter<LoadOnDemandEvent>();

  /**
   * Emitting event when an item is selected (tapped on mobile, clicked on web)
   */
  @Output() itemSelect = new EventEmitter<any>();

  // The first element that matches ListItemDirective. As a structural directive it unfolds into a template. This is a reference to that.
  @ContentChild(ListItemTemplateDirective, { static: true, read: TemplateRef })
  itemTemplate: TemplateRef<any>;
  @ContentChild(ListItemDirective, { static: true, read: TemplateRef })
  legacyItemTemplate: TemplateRef<any>;
  @ContentChildren(ItemComponent)
  kirbyItems: ItemComponent[];
  @ContentChild(ListFlexItemDirective, { static: true, read: TemplateRef })
  legacyFlexItemTemplate: TemplateRef<any>;
  @ContentChild(ListHeaderDirective, { static: false, read: TemplateRef })
  headerTemplate: TemplateRef<any>;
  @ContentChild(ListSectionHeaderDirective, { static: false, read: TemplateRef })
  sectionHeaderTemplate: TemplateRef<any>;
  @ContentChild(ListFooterDirective, { static: false, read: TemplateRef })
  footerTemplate: TemplateRef<any>;

  @HostBinding('class.has-sections') isSectionsEnabled: boolean;
  @HostBinding('class.has-deprecated-item-template') hasDeprecatedItemTemplate: boolean;
  isSwipingEnabled: boolean = false;
  isSelectable: boolean;
  isLoading: boolean;
  isLoadOnDemandEnabled: boolean;
  groupedItems: GroupedItem[];
  selectedItem: any;
  private orderMap: WeakMap<any, { isFirst: boolean; isLast: boolean }> = new WeakMap();
  private sectionNameMap: Map<number, string> = new Map();

  constructor(private listHelper: ListHelper, private groupBy: GroupByPipe) {}

  ngOnInit() {
    this.hasDeprecatedItemTemplate = !!this.legacyItemTemplate || !!this.legacyFlexItemTemplate;
    this.initializeSwipeActions();
    this.isSelectable = this.itemSelect.observers.length > 0;
    this.isLoadOnDemandEnabled = this.loadOnDemand.observers.length > 0;
  }

  ngAfterViewInit(): void {
    if (this.isSelectable) {
      setTimeout(() => {
        this.kirbyItems.forEach((item) => {
          item.selectable = true;
        });
      });
    }
  }

  private _headerFn(item: any, index: number, items: any[]) {
    return this.headerTemplate && index === 0 ? true : null;
  }

  headerFn = this._headerFn.bind(this);

  private _sectionHeaderFn = (item: any, index: number, items: any[]) => {
    return this.sectionNameMap.get(index);
  };

  sectionHeaderFn: (
    item: any,
    index: number,
    items: any[]
  ) => string | null = this._sectionHeaderFn.bind(this);

  private _footerFn(item: any, index: number, items: any[]) {
    return this.footerTemplate && items && items.length > 0 && items.length - 1 === index
      ? true
      : null;
  }

  footerFn = this._footerFn.bind(this);

  private kirbyItemHeightFn(item: any, index: number) {
    const dividerHeight = 1;
    if (this.isFirst(item) || this.isLast(item)) {
      const edgeHeight =
        +DesignTokenHelper.itemHeight().split('px')[0] + +DesignTokenHelper.size('xxs')[0];
      return this.showDivider ? edgeHeight + dividerHeight : edgeHeight;
    }

    const itemHeight = +DesignTokenHelper.itemHeight().split('px')[0];
    return this.showDivider ? itemHeight + dividerHeight : itemHeight;
  }

  isFirst(item: any) {
    return this.orderMap.get(item).isFirst;
  }
  isLast(item: any) {
    return this.orderMap.get(item).isLast;
  }

  ngOnChanges(): void {
    this.isSectionsEnabled = !!this.getSectionName;
    if (this.isSectionsEnabled && this.items) {
      this.groupedItems = this.groupBy.transform(this.items, this.getSectionName);
      this.sortedItems = this.groupedItems.reduce((prev, cur) => [...prev, ...cur.items], []);
      this.sectionNameMap = this.createSectionNameMap();
    } else {
      this.groupedItems = null;
    }
    this.orderMap = this.createOrderMap();
  }

  private createSectionNameMap() {
    const sectionNameMap = new Map<number, string>();
    const sectionNameSet = new Set<string>();
    // calculate section name for each item and add them to a index, section name | null map,
    this.sortedItems.forEach((item: any, index) => {
      const sectionName = this.getSectionName(item);
      if (sectionNameSet.has(sectionName)) {
        // if sectionname is already added to map, add null for other items
        sectionNameMap.set(index, null);
      } else {
        sectionNameMap.set(index, sectionName);
        sectionNameSet.add(sectionName);
      }
    });
    return sectionNameMap;
  }

  private createOrderMap(): WeakMap<any, { isFirst: boolean; isLast: boolean }> {
    const orderMap = new WeakMap<any, { isFirst: boolean; isLast: boolean }>();
    if (this.isSectionsEnabled && this.items) {
      this.groupedItems.forEach((group) => {
        const lastIndexInGroup = group.items.length - 1;
        group.items.forEach((item, index) => {
          const isFirst = index === 0;
          const isLast = index === lastIndexInGroup;
          orderMap.set(item, { isFirst, isLast });
        });
      });
    } else if (this.items) {
      const lastIndexInGroup = this.items.length - 1;
      this.items.forEach((item, index) => {
        const isFirst = index === 0;
        const isLast = index === lastIndexInGroup;
        orderMap.set(item, { isFirst, isLast });
      });
    }
    return orderMap;
  }

  onItemSelect(args: any) {
    this.selectedItem = this.listHelper.getSelectedItem(this.items, args);
    this.itemSelect.emit(this.selectedItem);
  }

  onLoadOnDemand(event?: LoadOnDemandEventData) {
    this.listHelper.onLoadOnDemand(this, event);
  }

  defaultTrackBy(index: number): any {
    return index;
  }

  sectionTrackBy(_: number, section: { name: string }): string {
    return section.name;
  }

  getSwipeActionsSide(side: 'left' | 'right', item: any): ListSwipeAction[] {
    if (!Array.isArray(this.swipeActions)) {
      return [];
    }
    return this.swipeActions.filter((sa) => {
      if (sa.isDisabled instanceof Function && sa.isDisabled(item)) {
        return false;
      }
      if (sa.isDisabled === true) {
        return false;
      }
      return sa.position === side;
    });
  }

  getSwipeActionIcon(swipeAction: ListSwipeAction, item: any): string {
    if (!swipeAction.icon) return;

    if (swipeAction.icon instanceof Function) {
      return swipeAction.icon(item);
    }
    return swipeAction.icon;
  }

  getSwipeActionTitle(swipeAction: ListSwipeAction, item: any): string {
    if (swipeAction.title instanceof Function) {
      return swipeAction.title(item);
    }
    return swipeAction.title;
  }

  getSwipeActionType(swipeAction: ListSwipeAction, item: any): ThemeColor {
    if (swipeAction.type instanceof Function) {
      return swipeAction.type(item);
    }
    return swipeAction.type;
  }

  onSwipeActionSelect(swipeAction: ListSwipeAction, item: any, event: Event): void {
    swipeAction.onSelected(item);
    this.list.closeSlidingItems();
    event.stopPropagation();
  }

  onResize(): void {
    this.initializeSwipeActions();
  }

  private initializeSwipeActions(): void {
    const large = 1025; //TODO this need to be refactored.
    if (this.swipeActions && this.swipeActions.length) {
      this.isSwipingEnabled = window.innerWidth < large;
      if (this.list && !this.isSwipingEnabled) {
        this.list.closeSlidingItems();
      }
    }
  }
}
