import { useContext } from 'react';
import StateManagedSelect from 'react-select';
import Select from 'react-select';
import { ThemeContext } from '../App';
import { createSelectStyles } from '../editor/utilities';

export function ThemedSelect({...args}: Parameters<Select>[0]) {
    const {theme} = useContext(ThemeContext)
    const styles = createSelectStyles(theme)
    return (
        <Select {...args} styles={styles}/>
    )
}
