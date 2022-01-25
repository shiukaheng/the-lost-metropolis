import { BufferGeometry, BufferAttribute } from "three"

export default class RoundedRectangleGeometry extends BufferGeometry {
    
    constructor( width=1, height=1, radius=0.25, smoothness=10 ) {
        
        super( );
        
        this.type = 'RoundedRectangleGeometry';
        
        this.parameters = {
            
            width: width,
            height: height,
            radius: radius,
            smoothness: smoothness
            
        };
        

        // helper const's
        const wi = width / 2 - radius;		// inner width
        const hi = height / 2 - radius;		// inner height
        const w2 = width / 2;			// half width
        const h2 = height / 2;			// half height
        const ul = radius / width;			// u left
        const ur = ( width - radius ) / width;	// u right
        const vl = radius / height;			// v low
        const vh = ( height - radius ) / height;	// v high	
        
        let positions = [
        
            wi, hi, 0, -wi, hi, 0, -wi, -hi, 0, wi, -hi, 0
            
        ];
        
        let uvs = [
            
            ur, vh, ul, vh, ul, vl, ur, vl
            
        ];
        
        let n = [
            
            3 * ( smoothness + 1 ) + 3,  3 * ( smoothness + 1 ) + 4,  smoothness + 4,  smoothness + 5,
            2 * ( smoothness + 1 ) + 4,  2,  1,  2 * ( smoothness + 1 ) + 3,
            3,  4 * ( smoothness + 1 ) + 3,  4, 0
            
        ];
        
        let indices = [
            
            n[0], n[1], n[2],  n[0], n[2],  n[3],
            n[4], n[5], n[6],  n[4], n[6],  n[7],
            n[8], n[9], n[10], n[8], n[10], n[11]
            
        ];
        
        let phi, cos, sin, xc, yc, uc, vc, idx;
        
        for ( let i = 0; i < 4; i ++ ) {
        
            xc = i < 1 || i > 2 ? wi : -wi;
            yc = i < 2 ? hi : -hi;
            
            uc = i < 1 || i > 2 ? ur : ul;
            vc = i < 2 ? vh : vl;
                
            for ( let j = 0; j <= smoothness; j ++ ) {
            
                phi = Math.PI / 2  *  ( i + j / smoothness );
                cos = Math.cos( phi );
                sin = Math.sin( phi );

                positions.push( xc + radius * cos, yc + radius * sin, 0 );

                uvs.push( uc + ul * cos, vc + vl * sin );
                        
                if ( j < smoothness ) {
                
                    idx =  ( smoothness + 1 ) * i + j + 4;
                    indices.push( i, idx, idx + 1 );
                    
                }
                
            }
            
        }

        this.setIndex( new BufferAttribute( new Uint32Array( indices ), 1 ) );
        this.setAttribute( 'position', new BufferAttribute( new Float32Array( positions ), 3 ) );
        this.setAttribute( 'uv', new BufferAttribute( new Float32Array( uvs ), 2 ) );
    }

    static fromJSON( data ) {

		return new RoundedRectangleGeometry( data.width, data.height, data.radius, data.smoothness );

	}
    
}