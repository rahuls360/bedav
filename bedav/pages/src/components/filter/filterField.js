import React, {useContext, useEffect} from 'react'
import styled from 'styled-components'
import Checkbox from './checkbox'
import {SelectedFiltersContext} from '../home'

const StyledDiv = styled.div`
  margin: 0 0 30px;
  display: flex;
  align-items: center;
`

const StyledP = styled.p`
  margin: 0 0 0 10px;
  font-size: 17px;
  font-weight: 100;
  display: inline-block;
`

function FilterField(props) {
  const {children, value} = props
  const {filters, dispatchFilter} = useContext(SelectedFiltersContext)

  return (
    <StyledDiv>
      <Checkbox checked={filters.includes(value)} onClick={() => {dispatchFilter({type: value})} }/>
      <StyledP>{children}</StyledP>
    </StyledDiv>
  )
}

export default FilterField