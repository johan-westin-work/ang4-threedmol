import {Component, ElementRef} from '@angular/core';
// hack - make sure that jQuery plugins can find jquery reference
import * as $ from 'jquery';
import * as $3Dmol from '3dmol';

window["$"] = $;
window["jQuery"] = $;
window["$3Dmol"] = $3Dmol;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private elRef: ElementRef) {
  }

  title = '3Dmol example in Angular component';

  ngAfterViewInit() {
    console.log(this.title);
    this.init3Dmol();
  }

  init3Dmol(): void {
    // This does NOT work. it generated an exception with text g.width is not a function
    // var element = this.elRef.nativeElement.querySelector('#container-01');

    var e1 = this.elRef.nativeElement.querySelector('#container-01');
    var e2 = $('#container-01');

    var t1 = typeof e1;
    var t2 = typeof e2;

    var n1 = e1.constructor.name;
    var n2 = e2.constructor.name;

    var sdfDataValue = this.elRef.nativeElement.querySelector('#moldata_sdf').value;
    var sdfData2Value = $('#moldata_sdf').val();
    var config = {backgroundColor: 'white'};
    var viewer = $3Dmol.createViewer('container-01', config);
    this.initSDF(viewer, sdfDataValue);
  }

  getAtomLabels(sdfData: String): Array<AtomLabel> {
    var atoms = [];
    var lines = sdfData.split(/\r?\n|\r/);
    var atomCount = parseInt(lines[3].substr(0, 3));
    var bondCount = parseInt(lines[3].substr(3, 3));

    var i, line;
    for (i = 4; i < 4 + atomCount; i++) {
      line = lines[i];
      var elem = line.substr(31, 3).replace(/ /g, "");

      var atom = new Atom(
        elem[0].toUpperCase() + elem.substr(1).toLowerCase(),
        new Coordinate(
          parseFloat(line.substr(0, 10)),
          parseFloat(line.substr(10, 10)),
          parseFloat(line.substr(20, 10))
        )
      );
      atoms.push(atom);
    }

    var atomLabels = [];
    for (i = 4 + atomCount + bondCount; i < lines.length; i++) {
      line = lines[i];
      if (line.startsWith("A")) {
        var parts = line.split(/\s+/);
        var atomSerial = parseInt(parts[1]);
        var atomWithLabel = new AtomLabel(lines[i + 1], atoms[atomSerial - 1]);
        i++;
        atomLabels.push(atomWithLabel);
      }
    }
    return atomLabels;
  };

  initSDF(viewer: any, sdfData: String): void {
    viewer.addModel(sdfData, "sdf");
    var atomLabels = this.getAtomLabels(sdfData);
    var i;
    for (i = 0; i < atomLabels.length; i++) {
      var atomWithLabel = atomLabels[i];
      viewer.addLabel(atomWithLabel.label, {
        position: atomWithLabel.atom.coord,
        backgroundColor: 0xff0000,
        backgroundOpacity: 0.8
      });
    }
    viewer.setStyle({stick: {}});
    viewer.zoomTo();
    viewer.render();
  };
}

class Coordinate {
  constructor(public x: number, public y: number, public z: number) {
  }
}

class Atom {
  constructor(public atom: String, public coord: Coordinate) {
  }
}

class AtomLabel {
  constructor(public label: String, public atom: Atom) {
  }
}
