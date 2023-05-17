import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { PaginatorHelperComponent } from '../component/paginator-helper/paginator-helper.component';
import { CharacterDetailComponent } from './character-detail/character-detail.component';

const GET_CHARACTERS = gql`
  query Characters($page: Int, $pageSize: Int, $filter: CharacterFilterInput) {
    characters(page: $page, pageSize: $pageSize, filter: $filter) {
        items {
            _id
            alignment
            allies
            enemies
            films
            imageUrl
            name
            parkAttractions
            shortFilms
            sourceUrl
            tvShows
            url
            videoGames
        }
        paginationInfo {
            hasNextPage
            hasPreviousPage
            pageItemCount
            totalPages
        }
    }
  }
`;

export interface IDisneyCharacter {
  _id: string;
  url: string;
  name: string;
  sourceUrl: string;
  films: string[];
  imageUrl: string;
  shortFilms: string[];
  tvShows: string[];
  videoGames: string[];
  alignment: string;
  parkAttractions: string[];
  allies: string[];
  enemies: string[];
}

export interface DisneyCharacterTable {
  id: string;
  name: string;
  tvShowsParticapating: number;
  videoGamesParticipating: number;
  allies: string[];
  enemies: string[];
}

export interface PaginationInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageItemCount: number;
  totalPages: number;
}

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.css']
})
export class CharactersComponent implements OnInit {
  dataSource = new MatTableDataSource<DisneyCharacterTable>([]);
  displayedColumns: string[] = ['name', 'tvShowsParticapating', 'videoGamesParticipating', 'allies', 'enemies'];
  pageSizeOptions = [10, 20, 50, 100, 200, 500];
  initialPageSize = 50;
  initialPage = 1;

  pageSize: number = this.initialPageSize;
  page: number = this.initialPage;

  characters: IDisneyCharacter[] = [];
  paginationInfo: PaginationInfo = {} as PaginationInfo;
  loading: boolean;
  error: any;

  private querySubscription: Subscription;

  @Input() inputValue: string;
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    if (!this.dataSource.sort) {
      this.dataSource.sort = sort;
    }
  }
  @ViewChild(PaginatorHelperComponent) paginator!: PaginatorHelperComponent;

  constructor(
    private apollo: Apollo,
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.pageSize = this.initialPageSize
    this.page = this.initialPage;
  }

  ngAfterViewInit() {
    this.querySubscription = this.apolloQuery({
      pageSize: this.pageSize,
      page: this.page,
    });

    this.paginator.onPageChange.subscribe((event: number) => {
      this.apolloQuery({
        pageSize: this.pageSize,
        page: event,
      });
    });

    this.paginator.onPageSizeChange.subscribe((event: number) => {
      this.pageSize = event;

      this.apolloQuery({
        pageSize: event,
        page: 1,
      });
    });
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  openDialog(id: string) {
    const dialogRef = this.dialog.open(CharacterDetailComponent, {
      data: { character: this.characters.find((character: IDisneyCharacter) => character._id === id) },
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
    });
  }

  apolloQuery(values: {
    pageSize: number;
    page: number;
  }) {
    let variables: any = values;
    if (this.inputValue !== '' && this.inputValue !== undefined) {
      variables = {
        ...values,
        filter: {
          name: this.inputValue
        }
      }
    }

    return this.apollo
      .watchQuery({
        query: GET_CHARACTERS,
        variables,
      })
      .valueChanges.subscribe(({ data, loading, error }) => {
        this.handleQueryResult(data);
        this.loading = loading;
        this.error = error;
      });
  }

  handleQueryResult(result: any) {
    if (result && result.characters) {
      this.characters = result.characters?.items;
      this.paginationInfo = result.characters?.paginationInfo;
  
      this.dataSource = new MatTableDataSource(this.characters.map((character: IDisneyCharacter) => {
        return this.mappingCharacterToTable(character);
      }));
    }    
  }

  mappingCharacterToTable(character: IDisneyCharacter): DisneyCharacterTable {
    const { tvShows, videoGames, name, allies, enemies, _id } = character;

    return {
      id: _id,
      name,
      allies,
      enemies,
      tvShowsParticapating: tvShows.length,
      videoGamesParticipating: videoGames.length,
    } as DisneyCharacterTable;
  }

  getRangeDisplayText = (page: number, pageSize: number, length: number) => {
    const initialText = `Page`;
    if (length == 0 || pageSize == 0) {
      return `${initialText} 0 of ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    return `${initialText} ${startIndex + 1} of ${length}`;
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['inputValue'].currentValue !== changes['inputValue'].previousValue) {
        this.inputValue = changes['inputValue'].currentValue;
        this.apolloQuery({
          pageSize: this.pageSize,
          page: 1,
        });
    }
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
    this.paginator.onPageChange.unsubscribe();
    this.paginator.onPageSizeChange.unsubscribe();
  }
}
