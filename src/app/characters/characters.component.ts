import { Component, OnInit, ViewChild } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { PaginatorHelperComponent } from '../component/paginator-helper/paginator-helper.component';

const GET_CHARACTERS = gql`
  query Characters($page: Int, $pageSize: Int) {
    characters(page: $page, pageSize: $pageSize) {
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

export interface DisneyCharacter {
  _id: string;
  url: string;
  name: string;
  sourceUrl: string;
  films: string[];
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
  
  characters: DisneyCharacter[] = [];
  paginationInfo: PaginationInfo = {} as PaginationInfo;
  loading = true;
  error: any;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(PaginatorHelperComponent) paginator!: PaginatorHelperComponent;

  constructor(
    private apollo: Apollo,
    private _liveAnnouncer: LiveAnnouncer
  ) { }

  ngOnInit(): void {
    this.pageSize = this.initialPageSize
    this.page = this.initialPage;
   }

  ngAfterViewInit() {

    this.apolloQuery({
      pageSize: this.pageSize,
      page: this.page,
    });
    
    this.dataSource.sort = this.sort;

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

  apolloQuery(variables: {
    pageSize: number;
    page: number;
  }) {
    this.apollo
      .watchQuery({
        query: GET_CHARACTERS,
        variables,
      })
      .valueChanges.subscribe((result: any) => {
        this.handleQueryResult(result);
      });
  }

  handleQueryResult(result: any) {
    this.characters = result?.data?.characters?.items;
    this.paginationInfo = result?.data?.characters?.paginationInfo;
    this.loading = result.loading;
    this.error = result.error;

    this.dataSource = new MatTableDataSource(this.characters.map((character: DisneyCharacter) => {
      return this.mappingCharacterToTable(character);
    }));
  }

  mappingCharacterToTable(character: DisneyCharacter): DisneyCharacterTable {
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
}
