import React from 'react'
import styled from 'styled-components'
import { QueryRenderer, graphql } from 'react-relay'
import { useParams } from 'react-router-dom'
import environment from '../../Environment'
import LeftSection from './left'
import RightSection from './right'

const StyledDiv = styled.div`
  width: 100%;
  overflow-y: scroll;
  max-width: 1500px;
  margin: 100px auto 0;
  padding: 0 20px;
`

function Hospital() {
  const {hospitalId} = useParams()
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query hospitalQuery($hospitalID: ID!) {
          hospital(id: $hospitalID) {
            id
            name
            phone
            address
            website
            placeId
            latitude
            longitude
            icuAvailable
            hduAvailable
            generalAvailable
            ventilatorsAvailable
            icuOccupied
            hduOccupied
            generalOccupied
            ventilatorsOccupied
            icuTotal
            hduTotal
            generalTotal
            ventilatorsTotal
          }
        }
      `}

      variables={{
        hospitalID: hospitalId
      }}

      render={({error, props}) => {
        if(error) {
          return
        }

        if(props) {
          return (
            <StyledDiv>
              <LeftSection hospital={props.hospital}/>
              <RightSection />
            </StyledDiv>
          )
        }
      }}
    />
  )
}

export default Hospital