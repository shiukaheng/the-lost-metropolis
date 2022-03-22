import { SwitchTransition, CSSTransition } from 'react-transition-group';
import { Fade } from 'react-reveal';
import MagicDiv from './MagicDiv';
import { useMultilang } from '../../utilities';
import { twMerge } from 'tailwind-merge'

type LoadingScreenProps = {
    children?: React.ReactNode;
    ready?: boolean
    loadingDivClassname?: string;
}

export default function LoadingScreen({ready=false, children=null, loadingDivClassname="absolute"}:LoadingScreenProps) {
    const text = useMultilang({
        en: "loading...",
        zh: "載入中..."
    })
    return (
        <SwitchTransition>
            <CSSTransition key={ready ? "a" : "b"} classNames="page-transition" timeout={250}>
                {
                    !ready
                    ?
                    <div className={twMerge('h-full w-full flex justify-center items-center', loadingDivClassname)}>
                        <MagicDiv>
                            <Fade top cascade>
                                <div className="text-3xl md:text-5xl font-black">
                                    {text}
                                </div>
                            </Fade>
                        </MagicDiv>
                    </div>
                    :
                    <div className="w-full h-full">
                        {children}
                    </div>
                }
            </CSSTransition>
        </SwitchTransition>
    );
}