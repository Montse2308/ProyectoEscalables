import { Component } from "@angular/core"

@Component({
  selector: "app-root",
  template: `
    <app-header></app-header>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "FuerzApp"
}
