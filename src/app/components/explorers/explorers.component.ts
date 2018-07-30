import { Component, OnInit } from '@angular/core';
import { ExplorerComponent } from './explorer/explorer.component';
import { FilesACLsService } from '../../services/filesacls.service';
import { AuthService } from '../../services/auth.service';
import { FilesACL } from '../../interfaces';
import { appAnimations } from '../../animations';

@Component({
  selector: 'app-explorers',
  templateUrl: './explorers.component.html',
  styleUrls: ['./explorers.component.css'],
  providers: [FilesACLsService],
  animations: [appAnimations]
})
export class ExplorersComponent implements OnInit {

  public filesacls: FilesACL[];

  constructor(private filesACLsService: FilesACLsService, private authService: AuthService) { }

  ngOnInit() {
    this.filesACLsService.getFilesACLs().subscribe(data => {
      this.filesacls = data.filter(filesacls => filesacls.roles.includes(this.authService.getRoleFromToken()));
    });
  }

  currentPathChanged(event: [string, string]) {
    this.filesacls.find(value => value.name === event[0]).currentPath = event[1];
  }

}
