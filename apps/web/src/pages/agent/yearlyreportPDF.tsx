/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable new-cap */
/* eslint-disable react/button-has-type */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/react-in-jsx-scope */
import { useEffect, useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import dayjs from 'dayjs'
import Image from 'next/image'
import { useRouter } from 'next/router'
import styles from './pdfstyle.module.css'
import logo from '../../assets/images/homecarerealty-logo.png'
import { storage } from '../../lib/utils'

function yearlyreportPDF() {
  const [loader, setLoader] = useState(false)
  // Data for Monthly
  const [monthly, setMonthly] = useState([])
  // Data for Yearly
  const [yearly, setYearly] = useState([])
  // Data for Maintenance
  const [maintenance, setMaintenance] = useState([])

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
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      const doc = new jsPDF('p', 'mm')
      let position = 0

      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        doc.addPage()
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      setLoader(false)
      doc.save(`${year}-YearlyReport.pdf`)
    })
  }

  useEffect(() => {
    Promise.all([
      fetch(`${baseURL}/adminreport/${id}/${year}/${month}`, { headers }),
      fetch(`${baseURL}/rents/property/year/report/${id}/${year}`, { headers }),
      fetch(`${baseURL}/maintenances/property/${id}`, { headers })
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
        setError(e)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])
  if (loading) return 'loading....'
  if (error) return 'something goes wrong..'

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
            <span>Landlord Property Yearly Statement</span>
          </div>
          {monthly.map((datas: any) => (
            <div className={styles.datarow} key={datas.property_docs.email}>
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
            <div className={styles.datarow} key={datas.agent_docs.mobile}>
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

              {/* <div className={styles.datarowborderbottom}>
                <span className={styles.fontweight}>Transaction Date:</span>
                <span>{dayjs(datas.rent_date).format(dateFormat)}</span>
              </div> */}
            </div>
          ))}

          {/* Yearly Earning Information  */}
          {yearly.map((datas: any) => (
            <>
              <div className={styles.coloredrow}>
                <span>
                  Earning Information of{' '}
                  {dayjs(datas.rent_date).format(dateFormat)}
                </span>
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
                  {((datas.agent_amount + datas.company_amount) / 1.05).toFixed(
                    2
                  )}
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
            </>
          ))}

          {/* maintenance info */}

          <div className={styles.coloredrow}>
            <span>Maintenance Details</span>
          </div>
          {maintenance.map((datas: any, idx: number) => (
            <div className={styles.datarow} key={idx}>
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

export default yearlyreportPDF
