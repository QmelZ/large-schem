let schem = extend(Schematics, {
    create(x, y, x2, y2){
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
    }
});

Vars.schematics = schem;
