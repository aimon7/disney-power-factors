import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-paginator-helper',
  templateUrl: './paginator-helper.component.html',
  styleUrls: ['./paginator-helper.component.css']
})
export class PaginatorHelperComponent implements OnChanges {
  @Input() initialPageSize: number = 50;
  @Input() totalPages: number = 1;
  @Input() initialPageSizeOptions: number[] = [5, 10, 25, 50, 100];

  @Output() onPageSizeChange = new EventEmitter<number>();
  @Output() onPageChange = new EventEmitter<number>();

  pageSize: number = this.initialPageSize;
  currentPage: number = 1;
  pageSizeOptions: number[] = this.initialPageSizeOptions

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['totalPages']) {
      this.totalPages = changes['totalPages'].currentValue
      this.currentPage = 1;
    }

    if (changes['initialPageSizeOptions']) {
      this.pageSizeOptions = changes['initialPageSizeOptions'].currentValue
    }
  }

  ngOnInit() {
    this.pageSize = this.initialPageSize;
    this.currentPage = 1;
  }

  onPageSizeChangeHandler(selection: number) {
    this.pageSize = selection;

    this.onPageSizeChange.emit(selection);
  }

  onPageChangeHandler(pageNumber: number) {
    if (pageNumber < 1 || pageNumber >= this.totalPages) return;

    this.currentPage = pageNumber;
    this.onPageChange.emit(pageNumber);
  }
}