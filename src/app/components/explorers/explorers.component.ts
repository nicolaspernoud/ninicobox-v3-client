import { Component, OnInit } from '@angular/core';
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

  public filesacls: FilesACL[] = [];
  public loading = true;

  constructor(private filesACLsService: FilesACLsService, private authService: AuthService) { }

  ngOnInit() {
    this.filesACLsService.getFilesACLs().subscribe(data => {
      data.map(value => {
        this.filesacls.push(new FilesACL(value));
      });
      this.loading = false;
    });
  }

  currentPathChanged(event: [string, string]) {
    this.filesacls.find(value => value.name === event[0]).currentPath = event[1];
  }

  refreshDiskUsage() {
    this.filesACLsService.getFilesACLs().subscribe(data => {
      data.map(val => {
        const acl = this.filesacls.find(value => value.name === val.name);
        acl.usedgb = val.usedgb;
        acl.totalgb = val.totalgb;
      });
    });
  }

}
