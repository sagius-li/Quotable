import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { ConfigObject, Quote } from '../dataContract';

@Component({
  selector: 'app-quotes',
  templateUrl: './quotes.component.html',
  styleUrls: ['./quotes.component.css'],
})
export class QuotesComponent implements OnInit {
  private configPath = '/assets/config.json';

  errorMessage = '';

  quotesUrl = '';
  category = 'happiness';
  quantity = 3;
  showAuthorAndTags: boolean | undefined = true;

  quotes: Array<Quote> = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // fetch data from config.json and set the quotes service url
    this.http
      .get<ConfigObject>(this.configPath)
      .pipe(
        tap((res: ConfigObject) => {
          this.quotesUrl = res.quotesUrl;
        })
      )
      .subscribe();
  }

  onSearch() {
    // call the quotes service to get quotes
    const url = `${this.quotesUrl}/quotes/random?tags=${this.category}&limit=${this.quantity}`;
    this.http
      .get<Array<Quote>>(url)
      .pipe(
        tap((res) => {
          this.quotes = res;
        })
      )
      .subscribe();
  }
}
