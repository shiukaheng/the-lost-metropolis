// Render table from content_array with labels content.name content.date_created

import tw from 'tailwind-styled-components';
import { useNavigate } from 'react-router-dom';

const StyledRow = tw.tr`border-b border-t border-black md:hover:opacity-50 transition-opacity duration-500 cursor-pointer`
// const StyledHeader = tw.th`text-left font-serif text-lg font-black`
const StyledCell = tw.td`text-left font-serif md:text-lg font-semibold pt-2 pb-6`

function ShowcaseContentList({content_array}) {
    const navigate = useNavigate();
    return ( 
        <div className="relative w-full h-full bg-white overflow-y-auto">
            <table className="w-full">
                <tbody>
                    {content_array.map((content, index) => (
                        <StyledRow key={index} onClick={()=>(navigate("/browse/"+content.id))}>
                            <StyledCell>{index}</StyledCell>
                            <StyledCell>{content.title_english.toLowerCase()}</StyledCell>
                            <StyledCell>{content.time_posted.toLowerCase()}</StyledCell>
                        </StyledRow>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ShowcaseContentList;
