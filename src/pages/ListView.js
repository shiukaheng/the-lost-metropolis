// Render table from content_array with labels content.name content.date_created

import tw from 'tailwind-styled-components';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { SettingsContext } from "../App";
import MagicDiv from '../components/MagicDiv';

const StyledRow = tw.tr`border-b border-t border-current md:hover:opacity-50 transition-opacity duration-500 cursor-pointer table-row`
const StyledCell = tw.td`text-left font-serif md:text-lg font-semibold pt-2 pb-6 table-cell`

function ListView({content_array}) {
    const navigate = useNavigate();
    const Settings = useContext(SettingsContext);
    return ( 
        <MagicDiv className="relative w-full h-full overflow-y-auto page-margins">
            <table className="w-full">
                <tbody>
                    {content_array.map((content, index) => (
                        <StyledRow key={index} onClick={()=>(navigate("/browse/"+content.id))}>
                            <StyledCell>{index}</StyledCell>
                            <StyledCell>{content.title[Settings.lang].toLowerCase()}</StyledCell>
                            <StyledCell>{content.time_posted.toLowerCase()}</StyledCell>
                        </StyledRow>
                    ))}
                </tbody>
            </table>
        </MagicDiv>
    );
}

export default ListView;
