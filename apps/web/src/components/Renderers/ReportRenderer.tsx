/* eslint-disable no-alert */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/destructuring-assignment */
import { Button } from '@mui/material'
import React from 'react'

const ReportRenderer = (props: any) => {
  const isFooter = () => {
    // don't display in the AG-Grid footer
    if (props.node.footer) {
      return true
    }
    return false
  }

  function monthlyReport(force = false) {
    const { data, context } = props // Parent/Child Communication using context
    let confirm = true
    if (!force) {
      confirm =
        global?.window &&
        window.confirm(`are you sure you want to redirect to report pages`)
    }
    if (confirm) {
      context.monthlyReportParent(data.property, data.rent_date) // pass the data to the parent component
    }
  }

  function yearlyReport(force = false) {
    const { data, context } = props // Parent/Child Communication using context
    let confirm = true
    if (!force) {
      confirm =
        global?.window &&
        window.confirm(`are you sure you want to redirect to report pages`)
    }
    if (confirm) {
      context.yearlyReportParent(data.property, data.rent_date) // pass the data to the parent component
    }
  }

  return (
    <div>
      {isFooter() ? (
        <span />
      ) : (
        <>
          <Button
            type="button"
            color="primary"
            variant="outlined"
            onClick={() => monthlyReport()}
          >
            Monthly
          </Button>
          <Button
            type="button"
            color="secondary"
            variant="outlined"
            onClick={() => yearlyReport()}
          >
            Yearly
          </Button>
        </>
      )}
    </div>
  )
}

export default ReportRenderer
