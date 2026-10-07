import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-module-placeholder',
  imports: [],
  templateUrl: './module-placeholder.html',
  styleUrl: './module-placeholder.css',
})
export class ModulePlaceholder {
  private readonly route = inject(ActivatedRoute);

  readonly title =
    this.route.snapshot.data['title'] ?? 'WorkSphere Module';
}
