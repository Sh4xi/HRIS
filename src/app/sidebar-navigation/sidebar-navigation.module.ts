import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarNavigationComponent } from './sidebar-navigation.component';

@NgModule({
  declarations: [SidebarNavigationComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [SidebarNavigationComponent] // Export the component for use in other modules
})
export class SidebarNavigationModule {}
