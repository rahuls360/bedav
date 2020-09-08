import React, { useEffect, useRef, useState } from 'react'
import { useDictState } from '../hooks'
import { QueryRenderer, graphql } from 'react-relay'
import Swal from 'sweetalert2'
import Spinner from '../Spinner'
import Environment from '../../Environment'
import FilterSection from './filter'
import TopSection from './TopSection'
import HospitalGrid from './hospitals/HospitalGrid'
import { SelectedFiltersProvider } from '../contexts/SelectedFilters'
import { SearchHospitalProvider } from '../contexts/SearchHospital'
import { SortProvider } from '../contexts/Sort'
import { LocalityProvider } from '../contexts/Locality'
import { HospitalsProvider } from '../contexts/Hospitals'

function LocalityPage(props) {
  const localityRef = useRef(props.match ? props.match.params.localityName : null)
  let localityName = localityRef.current
  const [updates, setUpdates] = useState(0)


  const [state, setState] = useDictState({
    geolocation: false,
    getData: false,
  })

  useEffect(() => {
    props.ensureDidMount()
  }, [])

  useEffect(() => {
    const currentName = props.match ? props.match.params.localityName : null

    if (currentName && currentName != localityRef.current && /^\/(?!about).*\/$/.test(window.location.pathname)) {
      localityRef.current = currentName
      setUpdates(updates + 1)
    }
  })

  function setCoords(position) {
    setState({
      geolocation: true,
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      getData: true
    })
  }

  function setPosition() {
    navigator.geolocation.getCurrentPosition(setCoords, () => { setState({geolocation: false, getData: true}) })
  }

  function requestAndSetPosition() {
    Swal.fire({
      title: "Find hospitals closest to you",
      html: "If you want to find the hospitals which are closest to you, please allow <b>bedav</b> to access your location.",
      icon: null,
      showCancelButton: true,
      cancelButtonText: "Not now",
      confirmButtonText: "Always Allow",
      padding: '3em 1em',
      width: '33em',
      confirmButtonColor: "#28a745"
    }).then(result => {
      if(result.isConfirmed === true) {
        setPosition()
      } else if (result.isConfirmed === false) {
        setState({
          getData: true
        })
      }
    })
  }

  function handleGeolocationState(result) {
    switch(result.state) {
      case 'granted':
        setPosition()
        break
      case 'prompt':
        requestAndSetPosition()
        break
      case 'denied':
        setState({
          getData: true
        }) 
    }
  }

  function requestGeolocationRequest() {
    if(navigator.permissions !== undefined) {
      navigator.permissions.query({name: 'geolocation'}).then(result => {
        handleGeolocationState(result)
        result.onchange = handleGeolocationState(result)
      })  
    } else {
      requestAndSetPosition()
    }
  }

  useEffect(() => {
    if(navigator.geolocation) {
      requestGeolocationRequest()
    } else {
      setState({getData:true})
    }
  }, [])

  if (!(/^\/(?!about).*\/$/.test(window.location.pathname))) {
    return null
  }

  return (
    <div>
      <SelectedFiltersProvider>
        <LocalityProvider initial={localityName}>
          { state.getData ?
          <QueryRenderer 
            environment={Environment}
            query={graphql`
              query LocalityPageQuery($localityName: String)  {
                locality(name: $localityName) {
                  name
                  lastUpdated
                  ...TopSection_locality
                  ...Hospitals_locality
                }
              }
            `}
            variables={{
              searchQuery: '',
              categoryFilters: [],
              orderBy: state.geolocation ? "DISTANCE" : "AVAILABLE_GENERAL",
              descending: state.geolocation ? false : true,
              localityName: localityName
            }}
            render={localProps => {
              const {error} = localProps
              const queryProps = localProps.props
              if (error) {
                console.log(error)
              }

              if (!queryProps) {
                return <Spinner />
              }

              document.title = "Bedav - " + queryProps.locality.name

              return (
                <SearchHospitalProvider>
                  <SortProvider initial={{
                    field: state.geolocation ? "distance" : "generalAvailable",
                    descending: state.geolocation ? false : true
                  }}>
                      <TopSection locality={queryProps.locality}/>
                      <HospitalsProvider locality={queryProps.locality} latitude={state.lat} longitude={state.lon} geolocation={state.geolocation}>
                        <HospitalGrid getData={state.getData} geolocation={state.geolocation} />
                      </HospitalsProvider>
                  </SortProvider>
                </SearchHospitalProvider>
              )
            }}
          /> : <Spinner />}
          <FilterSection />
        </LocalityProvider>
      </SelectedFiltersProvider>
    </div>
  )
}

export default LocalityPage

