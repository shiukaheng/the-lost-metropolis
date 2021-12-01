import { ReactComponent as ChiLogo } from '../chilogo.svg';
import { ReactComponent as EngLogo } from '../englogo.svg';

function Logo() {
    return (
        // <div className="flex flex-col gap-4 pr-3 pb-2 justify-center">
        <div className="flex flex-row md:flex-col gap-4 pb-2 md:pr-3 justify-left">
            {/* <ChiLogo className="w-36 fill-current relative left-2" /> */}
            {/* <EngLogo className="w-36 fill-current relative left-3" /> */}
            <ChiLogo className="h-12 md:h-auto md:w-36 fill-current relative" />
            <EngLogo className="h-12 md:h-auto md:w-36 fill-current relative" />
        </div>
    )
}

export default Logo