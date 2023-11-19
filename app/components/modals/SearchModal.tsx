'use client'
import qs from 'query-string'
import React, { useCallback, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Range } from 'react-date-range'
import useSearchModal from '@/app/hooks/useSearchModal'

import dynamic from 'next/dynamic'

import Modal from './Modal'
import CountrySelect, { CountrySelectValue } from '../inputs/CountrySelect'
import { formatISO } from 'date-fns'
import Heading from '../Heading'

enum STEPS {
    LOCATION = 0,
    DATE = 1,
    INFO = 2
}
const SearchModal = () => {
    const router = useRouter();
    const params = useSearchParams();
    const searchModal = useSearchModal();

    const [location, setLocation] = useState<CountrySelectValue>()
    const [step, setStep] = useState(1);
    const [guestCount, setGuestCount] = useState(1)
    const [roomCount, setRoomCount] = useState(1)
    const [bathroomCount, setBathroomCount] = useState(1)
    const [dateRange, setDateRange] = useState<Range>({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
    })

    const Map = useMemo(() => dynamic(() => import('../Map'), { ssr: false }), [location]);

    const onNext = useCallback(() => {
        setStep((value) => value + 1)
    }, [])

    const onBack = useCallback(() => {
        setStep((value) => value - 1)
    }, [])

    const onSubmit = useCallback(async () => {
        if (step !== STEPS.INFO) {
            return onNext();
        }
        let currentQuery = {};

        if (params) {
            currentQuery = qs.parse(params.toString())
        }
        const updatedQuery: any = {
            ...currentQuery,
            locationValue: location?.value,
            guestCount,
            roomCount,
            bathroomCount,
        }

        if (dateRange.startDate) {
            updatedQuery.startDate = formatISO(dateRange.startDate)
        }

        if (dateRange.endDate) {
            updatedQuery.endDate = formatISO(dateRange.endDate)
        }

        const url = qs.stringifyUrl({
            url: '/',
            query: updatedQuery
        }, { skipNull: true });

        setStep(STEPS.LOCATION);
        searchModal.onClose();

        router.push(url)
    }, [step, searchModal, guestCount, roomCount, bathroomCount, location, router, dateRange, onNext, params])

    const actionLabel = useMemo(() => {
        if (step === STEPS.INFO) {
            return 'Search'
        }
        return "Next"
    }, [step])

    const secondaryActionLabel = useMemo(() => {
        if (step === STEPS.LOCATION) {
            return undefined
        }
        return "Back"
    }, [step])

    let bodyContent = (
        <div className='flex flex-col gap-8'>
            <Heading
            title='Where do you wanno go?'
            subtitle='Find the perfect location'
            />
            <CountrySelect
            value={location}
            onChange={(value)=> setLocation(value as CountrySelectValue)}/>
            <hr />
            <Map center={location?.latlng} />
        </div>
    )
    return (
        <Modal
            isOpen={searchModal.isOpen}
            onClose={searchModal.onClose}
            onSubmit={searchModal.onOpen}
            title='Filters'
            actionLabel='Search'
            body={bodyContent} />
    )

}

export default SearchModal