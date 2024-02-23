/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/button-has-type */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable new-cap */
/* eslint-disable react-hooks/rules-of-hooks */
// @ts-ignore
import { useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import dayjs from 'dayjs'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React from 'react'
import styles from './pdfstyle.module.css'
import logo from '../../assets/images/homecarerealty-logo.png'
import { storage } from '../../lib/utils'

function monthlyreportPDF() {
  const [loader, setLoader] = useState(false)
  // Data for Monthly
  const [monthly, setMonthly] = useState([])
  // Data for Yearly
  const [yearly, setYearly] = useState([])
  // Data for Maintenance
  const [maintenance, setMaintenance] = useState([])
  // Or combine them into one state variable
  const [combinedData, setCombinedData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const dateFormat = 'YYYY/MMM'

  const router = useRouter()
  const id = router.query.property_id
  const year = router.query.rent_year
  const month = router.query.rent_month
  const baseURL = process.env.NEXT_PUBLIC_API_URL
  const headers = { Authorization: `Bearer ${storage.getToken()}` }

  const downloadPDF = () => {
    const capture = document.getElementById('actualreceipt')
    setLoader(true)
    // @ts-ignore
    html2canvas(capture, {
      logging: true,
      letterRendering: 1,
      useCORS: true
    }).then((canvas) => {
      const imgData = canvas.toDataURL('img/png')
      const doc = new jsPDF('p', 'mm', 'a4')
      const componentWidth = doc.internal.pageSize.getWidth()
      const componentHeight = (canvas.height * componentWidth) / canvas.width
      doc.addImage(imgData, 'PNG', 0, 0, componentWidth, componentHeight)
      setLoader(false)
      doc.save(`${year}-${month}-MonthlyReport.pdf`)
    })
  }
  // current data

  useEffect(() => {
    Promise.all([
      // property id ,monthly
      fetch(`${baseURL}/adminreport/${id}/${year}/${month}`, { headers }),
      // property id , yearly
      fetch(`${baseURL}/rents/property/${id}/${year}/${month}`, { headers }),
      // property id ,maintenance
      fetch(`${baseURL}/maintenances/property/${id}/${year}/${month}`, {
        headers
      })
    ])
      .then(([resMonth, resYear, resMaintenance]) =>
        Promise.all([resMonth.json(), resYear.json(), resMaintenance.json()])
      )
      .then(([dataMonth, dataYear, dataMaintenance]) => {
        setMonthly(dataMonth)
        setYearly(dataYear)
        setMaintenance(dataMaintenance)
        // setCombinedData(dataUsers.concat(dataPosts));
      })
      .catch((e) => {
        console.error('Error fetching data', e)
        setError(e)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])
  if (loading) return 'loading....'
  if (error) return 'something goes wrong..'
  console.log(maintenance)

  return (
    <div className={styles.wrapper}>
      <div className={styles.receiptbox}>
        {/* actual receipt */}
        <div className={styles.actualreceipt} id="actualreceipt">
          {/* organization logo */}
          <div className={styles.receiptorganizationlogo}>
            <Image alt="logo" src={logo} />
          </div>

          {/* organization name */}
          <h5>HOMECARE REALTY LTD.</h5>

          {/* street address and unit number */}
          <h6>Suite 214,222-16 Ave NE </h6>

          {/* city province postal code */}
          <h6>Calgary,Alberta T2E 1J8</h6>

          {/* email-phone-and-website */}
          <div className={styles.phoneandwebsite}>
            <h6>Tel: 587-432-1588</h6>

            <p>
              <a href="https://www.homecarerealty.com" target="blank">
                https://www.homecarerealty.com
              </a>
            </p>
          </div>
          <h6>
            <i>Your Local Property Management Professionals!</i>
          </h6>
          <br />

          <div className={styles.coloredrow}>
            <span>Landlord Property Monthly Statement</span>
          </div>
          {monthly.map((datas: any) => (
            <div className={styles.datarow}>
              <div className={styles.datarowborderbottom}>
                <span className={styles.fontweight}>Landlord Name:</span>
                <span>{datas.property_docs.landlord}</span>
              </div>

              <div className={styles.datarowborderbottom}>
                <span className={styles.fontweight}>Address:</span>
                <span>{datas.prop_address}</span>
              </div>

              <div className={styles.datarowborderbottom}>
                <span className={styles.fontweight}>Landlord Email:</span>
                <span>{datas.property_docs.email}</span>
              </div>

              {/* <div className={styles.datarowborderbottom}>
                <span className={styles.fontweight}>Postal Code:</span>
                <span>4444</span>
              </div> */}
            </div>
          ))}
          <br />
          {/* Property Information */}
          <div className={styles.coloredrow}>
            <span>Property Information</span>
          </div>
          {monthly.map((datas: any) => (
            <div className={styles.datarow}>
              <div className={styles.datarowborderbottom}>
                <span className={styles.fontweight}>Property Address:</span>
                <span>{datas.prop_address}</span>
              </div>

              <div className={styles.datarowborderbottom}>
                <span className={styles.fontweight}>Property Manager:</span>
                <span>{datas.agent_fullname}</span>
              </div>

              <div className={styles.datarowborderbottom}>
                <span className={styles.fontweight}>Phone:</span>
                <span>{datas.agent_docs.mobile}</span>
              </div>

              <div className={styles.datarowborderbottom}>
                <span className={styles.fontweight}>Transaction Date:</span>
                <span>{dayjs(datas.rent_date).format(dateFormat)}</span>
              </div>
            </div>
          ))}
          {/* Earning Information (Current) */}
          <div className={styles.floatcontainer}>
            {monthly.map((datas: any) => (
              <div className={styles.floatchild}>
                <div className={styles.coloredrow}>
                  <span>Earning Information (Current)</span>
                  <span />
                </div>

                <div className={styles.datarow}>
                  <span className={styles.fontweight}>Tenant Amount</span>
                  <span>${datas.tenant_amount}</span>
                </div>
                <div className={styles.datarow}>
                  <span className={styles.fontweight}>Agent Amount</span>
                  <span>
                    $
                    {(
                      (datas.agent_amount + datas.company_amount) /
                      1.05
                    ).toFixed(2)}
                  </span>
                </div>
                <div className={styles.datarow}>
                  <span className={styles.fontweight}>GST(Agent)</span>
                  <span>
                    $
                    {`${(
                      datas.agent_amount +
                      datas.company_amount -
                      (datas.agent_amount + datas.company_amount) / 1.05
                    ).toFixed(2)} `}
                  </span>
                </div>
                <div className={styles.datarow}>
                  <span className={styles.fontweight}>CRA Amount</span>
                  <span>${datas.cra}</span>
                </div>
                <div className={styles.datarow}>
                  <span className={styles.fontweight}>Maintenance</span>
                  <span>${datas.maintenance.toFixed(2)}</span>
                </div>

                <div className={styles.datarow}>
                  <span className={styles.fontweight2}>
                    <b>landlord Total:</b>
                  </span>
                  <span>
                    <b>
                      ${' '}
                      {`${(
                        datas.tenant_amount -
                        datas.agent_amount -
                        (datas.maintenance - datas.maintenance * 0.05) -
                        datas.cra -
                        datas.company_amount -
                        datas.maintenance * 0.05
                      ).toFixed(2)} `}
                    </b>
                  </span>
                </div>
              </div>
            ))}

            {/* Earning Information (Year To Date) */}
            {yearly.map((datas: any) => (
              <div className={styles.floatchild}>
                <div className={styles.coloredrow}>
                  <span>Earning Information (Year To Date)</span>
                  <span />
                </div>
                <div className={styles.datarow}>
                  <span className={styles.fontweight}>Tenant Amount</span>
                  <span>$ {datas.tenant_amount}</span>
                </div>
                <div className={styles.datarow}>
                  <span className={styles.fontweight}>Agent Amount</span>
                  <span>
                    ${' '}
                    {(
                      (datas.agent_amount + datas.company_amount) /
                      1.05
                    ).toFixed(2)}
                  </span>
                </div>
                <div className={styles.datarow}>
                  <span className={styles.fontweight}>GST(Agent)</span>
                  <span>
                    ${' '}
                    {`${(
                      datas.agent_amount +
                      datas.company_amount -
                      (datas.agent_amount + datas.company_amount) / 1.05
                    ).toFixed(2)} `}
                  </span>
                </div>
                <div className={styles.datarow}>
                  <span className={styles.fontweight}>CRA Amount</span>
                  <span>${datas.cra}</span>
                </div>
                <div className={styles.datarow}>
                  <span className={styles.fontweight}>Maintenance</span>
                  <span>$ {datas.maintenance.toFixed(2)}</span>
                </div>
                <div className={styles.datarow}>
                  <span className={styles.fontweight2}>
                    <b>landlord Total:</b>
                  </span>
                  <span>
                    <b>
                      ${' '}
                      {`${(
                        datas.tenant_amount -
                        datas.agent_amount -
                        (datas.maintenance - datas.maintenance * 0.05) -
                        datas.cra -
                        datas.company_amount -
                        datas.maintenance * 0.05
                      ).toFixed(2)} `}
                    </b>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* maintenance info */}

          <div className={styles.coloredrow}>
            <span>Maintenance Details</span>
          </div>
          {maintenance.map((datas: any) => (
            <div className={styles.datarow}>
              <div className={styles.three_grid}>
                <div className={styles.datarowborderbottom}>
                  <div className={styles.column}>
                    <span className={styles.fontweight}>Item:</span>
                    <span>{datas.item}</span>
                  </div>
                </div>

                <div className={styles.datarowborderbottom}>
                  <div className={styles.column}>
                    <span className={styles.fontweight}>Date:</span>
                    <span>
                      {dayjs(datas.maintenance_date).format('YYYY/MMM/DD')}
                    </span>
                  </div>
                </div>

                <div className={styles.datarowborderbottom}>
                  <div className={styles.column}>
                    <span className={styles.fontweight}>Amount(incl.GST):</span>
                    <span>${`${datas.amount.toFixed(2)} `}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* 
          <div className={styles.coloredrow}>
            <span>Thank You For Your Generous Donation</span>
            <span />
          </div> */}
        </div>
        {/* end of actual receipt */}

        {/* receipt action */}
        <div className={styles.receiptactionsdiv}>
          <div className={styles.actionsright}>
            <button
              className={styles.receiptmodaldownloadbutton}
              onClick={downloadPDF}
              disabled={!(loader === false)}
            >
              {loader ? (
                <span>Downloading...</span>
              ) : (
                <span>Download Report</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default monthlyreportPDF
