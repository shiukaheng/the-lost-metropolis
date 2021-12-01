import { ReactComponent as ChiLogo } from '../chilogo.svg';
import { ReactComponent as EngLogo } from '../englogo.svg';

function Logo() {
    return (
        <div className="flex flex-col gap-4 pr-3 pb-2">
            <ChiLogo className="w-36 fill-current relative left-2" />
            <EngLogo className="w-36 fill-current relative left-3" />
        </div>
    )
}

export default Logo