// function \/ by ZestyLemonade, ty :)
function select(bind, color, onSelect){
  this.color = color.cpy();
  this.bcolor = color.cpy().sub(0.2, 0.2, 0.2, 0);
  this.startX = 0;
  this.startY = 0;
  this.clearing = false;
  this.bind = Packages.arc.input.KeyCode[bind];
  Events.run(Trigger.update, (e) => {
    if(!Vars.state.isPlaying()) return;
    if(Core.input.keyDown(this.bind)){
      if(!this.clearing){
        this.clearing = true;
        this.startX = mouseX();
        this.startY = mouseY();
      }
    } else {
      if(!this.clearing) return;
      this.clearing = false;
      let endX = mouseX();
      let endY = mouseY();
      if(endX < this.startX){
        let tmp = this.startX;
        this.startX = endX;
        endX = tmp;
      }
      if(endY < this.startY){
        let tmp = this.startY;
        this.startY = endY;
        endY = tmp;
      }

      onSelect(this.startX, this.startY, endX, endY);
    }
  });

  Events.run(Trigger.postDraw, (e) => {
    if(this.clearing){
      Lines.stroke(1);
      const result = Placement.normalizeDrawArea(
        Blocks.air,
        this.startX,
        this.startY,
        mouseX(),
        mouseY(),
        false,
        100,
        1
      );

      Lines.stroke(2);

      Draw.color(this.bcolor);
      Lines.rect(
        result.x,
        result.y - 1,
        result.x2 - result.x,
        result.y2 - result.y
      );
      Draw.color(this.color);
      Lines.rect(
        result.x,
        result.y,
        result.x2 - result.x,
        result.y2 - result.y
      );
    }
  });

  function mouseX(){
    return Math.floor(Vars.player.mouseX / Vars.tilesize + 0.5);
  }

  function mouseY(){
    return Math.floor(Vars.player.mouseY / Vars.tilesize + 0.5);
  }
}

// from this part on its my code
let create = (x, y, x2, y2) => {
        let result = Placement.normalizeArea(x, y, x2, y2, 0, false, 2147483647);
        x = result.x;
        y = result.y;
        x2 = result.x2;
        y2 = result.y2;

        let ox = x, oy = y, ox2 = x2, oy2 = y2;

        let tiles = new Seq();

        let minx = x2, miny = y2, maxx = x, maxy = y;
        let found = false;
        for(let cx = x; cx <= x2; cx++){
            for(let cy = y; cy <= y2; cy++){
                let linked = Vars.world.build(cx, cy);

                if(linked != null && (linked.block.isVisible() || linked.block() instanceof CoreBlock) && !(linked.block instanceof ConstructBlock)){
                    let top = linked.block.size/2;
                    let bot = linked.block.size % 2 == 1 ? -linked.block.size/2 : -(linked.block.size - 1)/2;
                    minx = Math.min(linked.tileX() + bot, minx);
                    miny = Math.min(linked.tileY() + bot, miny);
                    maxx = Math.max(linked.tileX() + top, maxx);
                    maxy = Math.max(linked.tileY() + top, maxy);
                    found = true;
                }
            }
        }

        if(found){
            x = minx;
            y = miny;
            x2 = maxx;
            y2 = maxy;
        }else{
            return new Schematic(new Seq(), new StringMap(), 1, 1);
        }

        let width = x2 - x + 1, height = y2 - y + 1;
        let offsetX = -x, offsetY = -y;
        let counted = new IntSet();
        for(let cx = ox; cx <= ox2; cx++){
            for(let cy = oy; cy <= oy2; cy++){
                let tile = Vars.world.build(cx, cy);

                if(tile != null && !counted.contains(tile.pos()) && !(tile.block instanceof ConstructBlock)
                    && (tile.block.isVisible() || tile.block instanceof CoreBlock)){
                    let config = tile.config();

                    tiles.add(new Schematic.Stile(tile.block, tile.tileX() + offsetX, tile.tileY() + offsetY, config, tile.rotation));
                    counted.add(tile.pos());
                }
            }
        }

        return new Schematic(tiles, new StringMap(), width, height);
};

let s = Vars.schematics;
new select("t", Pal.accent, (startX, startY, endX, endY) => {
    Vars.ui.showTextInput(
        "Copy your schematic and click any button to close",
        "schem:",
        0,
        s.writeBase64(create(startX, startY, endX, endY)),
        () => {}
    );
});
