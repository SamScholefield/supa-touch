import { Service, signal } from '@angular/core';

/**
 * Coordinates the header's hide/show state (below desktop) between the header and the page
 * toolbar, so the toolbar can slide its sticky offset up when the header auto-hides.
 */
@Service()
export class HeaderVisibility {
  readonly isHidden = signal(false);
}
