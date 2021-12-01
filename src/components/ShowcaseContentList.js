// Render table from content_array with labels content.name content.date_created

import tw from 'tailwind-styled-components';

const StyledRow = tw.tr`border-b border-t border-black`
// const StyledHeader = tw.th`text-left font-serif text-lg font-black`
const StyledCell = tw.td`text-left font-serif text-lg font-semibold pt-2 pb-6`

function ShowcaseContentList({content_array}) {
    return ( 
        <table className="w-full">
            <tbody>
                {content_array.map((content, index) => (
                    <StyledRow key={index}>
                        <StyledCell>{index}</StyledCell>
                        <StyledCell>{content.title_english.toLowerCase()}</StyledCell>
                        <StyledCell>{content.time_posted.toLowerCase()}</StyledCell>
                    </StyledRow>
                ))}
            </tbody>
        </table>
    );
}

export default ShowcaseContentList;