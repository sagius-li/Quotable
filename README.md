# Interview with Project Quotable

## Basic

- obserable object does nothing until subscribe() is called
- difference between ngOnInit and ngAfterViewInit
  - you cannot ensure, that the ViewChild element existing until ngAfterViewInit
- two way data binding
  - it works, but only with pre-defined input parameters

## Advanced

- add style `quote-selected` to selected quote
  - extend data model
    ```ts
    export interface Quote {
      author: string;
      authorSlug: string;
      content: string;
      dateAdded: string;
      dateModified: string;
      tags: Array<string>;
      selected?: boolean;
    }
    ```
  - add event handler
    ```ts
    onQuoteSelected(quote: Quote) {
      this.quotes.forEach((q) => (q.selected = false));
      quote.selected = true;
    }
    ```
  - add ngClass in html
    ```html
    <div class="quote-entry" [ngClass]="{ 'quote-selected': quote.selected }" (click)="onQuoteSelected(quote)">...</div>
    ```
- code efficiency: remove selected flag of other entries
  - no break in ForEach, using ForOf
  - using findIndex
  - persist the last selected item

## Security

- error handling when fetching quotes url from config.json
  - no quotesUrl key
    ```ts
    if (!res || !res.quotesUrl) {
      this.errorMessage = "No quotes url was found";
    }
    ```
  - no json file / file is invalid
    ```ts
    catchError((err: HttpErrorResponse) => {
      this.errorMessage = err.message;
      return EMPTY;
    });
    ```
- XSS
  ```html
  <img src="#" onerror="javascript:alert('xss');" />
  ```
- Query parameter injection
  - using
    ```
      happiness&author=the%20buddha
    ```
  - take a look at network tab
  - to prevent
    ```ts
    const url = `${this.quotesUrl}/quotes/random`;
    const params = new HttpParams({
      fromObject: {
        tags: this.category,
        limit: this.quantity,
      },
    });
    this.http
      .get(url, { params })
      .pipe(
        tap((res) => {
          console.log(res);
        })
      )
      .subscribe();
    ```

## Issues / improvements

- obserable object is still active after switching pages
- move config to a service, so that all components can use it

  ```
  - init the service and load config data
  - using quotesUrl in quotes component
  - using counterLabelColour in counter component
  - testing with invalid json format and missing keys
  ```

  - create the config.service.ts (ng g s config)

  ```ts
  import { Injectable } from "@angular/core";
  import { JSONObject, JSONValue } from "./dataContract";
  import { HttpClient, HttpErrorResponse } from "@angular/common/http";
  import { EMPTY, Observable } from "rxjs";
  import { catchError, tap } from "rxjs/operators";

  @Injectable({
    providedIn: "root",
  })
  export class ConfigService {
    private configPath = "../assets/config.json";
    private configData: JSONObject | undefined;

    errorMessage = "";
    loaded = false;

    constructor(private http: HttpClient) {}

    public loadConfig(): Observable<JSONObject> {
      return this.http.get<JSONObject>(this.configPath).pipe(
        tap((res) => {
          this.configData = res;
          this.loaded = true;
        }),
        catchError((err: HttpErrorResponse) => {
          this.errorMessage = err.message;
          return EMPTY;
        })
      );
    }

    public getConfig(key: string, fallback?: JSONValue): JSONValue {
      if (this.configData) {
        if (this.configData[key] !== undefined && this.configData[key] !== null) {
          return this.configData[key];
        }
      }

      return fallback ?? "";
    }
  }
  ```

  - init the service in app.compoment.ts and app.component.html

  ```ts
  configLoaded = false;

  constructor(private config: ConfigServiceService) {}

  ngOnInit(): void {
    this.config
      .loadConfig()
      .pipe(
        finalize(() => {
          this.configLoaded = true;
        })
      )
      .subscribe();
  }
  ```

  ```html
  <router-outlet *ngIf="configLoaded"></router-outlet>
  ```

  - use the service in quotes.component.ts

  ```ts
  ngOnInit(): void {
    if (this.config.hasError && this.config.errorMessage) {
      this.errorMessage = this.config.errorMessage;
    } else if (this.config.loaded) {
      this.quotesUrl = this.config.getConfig('quotesUrl').toString();
      if (!this.quotesUrl) {
        this.errorMessage = 'No service url was found';
      }
    } else {
      this.errorMessage = 'No config was loaded';
    }
  }
  ```

  - use the serice in counter.component.ts (without error handling)

  ```ts
  constructor(
    private renderer: Renderer2,
    private config: ConfigServiceService
  ) {
    this.labelColor = this.config
      .getConfig('counterLabelColour', '#008000')
      .toString();
  }
  ```

## Addon

- checkbox with 3 states

  ```
  - using config value if indeterminated
  - null handling (config value could be null)
  ```

  - define varibles
    ```ts
    private values = [undefined, true, false];
    private previousValue: undefined | true | false;
    configValue: undefined | true | false;
    ```
  - init varibles in ngOnInit

    ```ts
     ngOnInit(): void {
      if (this.config.errorMessage) {
        this.errorMessage = this.config.errorMessage;
      } else if (this.config.loaded) {
        this.quotesUrl = this.config.getConfig('quotesUrl').toString();
        if (!this.quotesUrl) {
          this.errorMessage = 'No service url was found';
        }

        const displayOption = this.config.getConfig('showAuthorAndTags');
        if (typeof displayOption === 'boolean') {
          this.showAuthorAndTags = displayOption;
        } else {
          this.showAuthorAndTags = false;
        }
        this.previousValue = this.showAuthorAndTags;
        this.configValue = this.showAuthorAndTags;
      } else {
        this.errorMessage = 'No config was loaded';
      }
    }
    ```

  - add event handler to handle change event
    ```ts
    onChangeDisplaySetting() {
      const posCurrent = this.values.indexOf(this.previousValue);
      const posNext = (posCurrent + 1) % this.values.length;
      this.showAuthorAndTags = this.values[posNext];
      this.previousValue = this.showAuthorAndTags;
    }
    ```
  - implement 3-state checkbox
    ```html
    <mat-checkbox [(ngModel)]="showAuthorAndTags" [indeterminate]="showAuthorAndTags === undefined" (change)="onChangeDisplaySetting()">Show author and tags</mat-checkbox>
    ```
  - show div depends on the checkbox
    ```html
    <div
      *ngIf="
        showAuthorAndTags === undefined
          ? configValue
          : showAuthorAndTags
      "
      class="quote-header"
    >
      {{ quote.author }} talked about {{ quote.tags.join(", ") }}
    </div>
    ```
