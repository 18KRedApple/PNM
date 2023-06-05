import React, {useContext, useEffect, useMemo, useRef, useState} from "react"
import {Page} from "../../Page";
import {Card} from "../../Card";
import {GridColumnApi, GridRowsProp} from "@mui/x-data-grid";
import {PAGE_SIZE} from "../../../constants";
import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string"
import { Modal } from "../../Modal";
import {ErrorText} from "../../styled";
import {CancelButton} from "../../styled/Button";
import {Button, Typography} from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import {DataGridComponent, DataGridPaginator} from "../../DataGridComponent";
import {RouteComponentProps} from "react-router";
import {Link} from "../../styled/Link";
import {useTrapBenefitsPackages} from "../../../hooks/TRAP/useTrapBenefitsPackages";
import {FilterQueryParamsManager} from "../../FilterQueryParamsManager/FilterQueryParamsManger";
import {TrapUniquePlanDesign, TrapMainUPD} from "../../../types";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

import {ModalStatus}  from "../../Modal/ConfirmationModal";
import {cloneDeep} from "lodash";
import { CreateTrapBenefitsPackageModal, NewTrapBenefitsPakage} from "../../Modal/TRAP/CreateTrapBenefitsPackageModal";
import {API_ROUTE, axios} from "../../../axiosInstance";
import {StateContext} from "../../store";
import {useTrapUpdList} from "../../../hooks/TRAP/useTrapUdpList";

type TrapUniquePlanDesignWithChildren = TrapUniquePlanDesign & {children?: TrapUniquePlanDesign[]};

const EXPANDED_COLOUMS = [
    "upd",
    "variant_code",
    "product_type",
    "state",
    "fed_avc",
    "fed_avc_note",
    "type",
];

const CHECKBOX_FIELDS = [
    "hsa",
    "createAliases",
    "tiered",
    "integrated",
]

const EMPTY_PACKAGE: NewTrapBenefitsPackage = {
    _id: "",
    name: "",
    exchange: "",
    metal_tier:"",
    integrated: false,
    tiered:false,
    hsa: false,
    createAliases:true,
    unique_plan_designs: [],
    avsn: "",
    upd: "",
}

export const TrapBenefitsPackagesPage = (props:RouteComponentProps) => {
    const history = useHistory();
    const location = useLocation();
    const queryStringValues = queryString.parse(location.search);
    const offset = parseInt(queryStringValues.offset as string) || 0;
    const { activeYear } = useContext(StateContext).settings;
    const [errorText, setErrorText] = useState<string>("");
    const [createBenefitsPackageModalStatus, setCreateBenefitsPackageStatus] = useState<ModalStatus("closed");
    const [createBenefitsPackageModalText, setCreateBenefitsPackageModalText] = useState<string>("");
    const [newBenefitsPackage, setNewBenefitsPackage] = useState<NewTrapBenefitsPakage>(cloneDeep(EMPTY_PACKAGE));
    const [expanededRow, setExpandedRow] = useState<String>("");
    const [expandedRowData, setExpanededRowData] = useState<string[][]>([]);

    const {data:trapUpdList} = useTrapUdpList()

    //DataGridComponent parameters
    const dataGridRef: React.MutableRefObject<any> = useRef();
    const [customClass, setStatusClass] = useState<{sx:any, param: string}>({sx:undefined, param: "_id"})
    const [rows, setRows] = useState<GridRowProp>([]);
    const [rowsCount, setRowCount] = useState<number>();
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZE);
    const [page, setPage] = useState<number> (Math.max(Math.floor(offset/pageSize),0));
    const [data, error] = useTrapBenefitsPackages();

    //build lists of existing names & unique plan designs
    const existingUniqueFieldLists = useMemo(() => {
        if(!data){
            return undefined
        }

        const lists: {name:string [], upd: string[]} = {name: [], upd: []}
        data.result.forEach(benefitsPackages => {

            lists.name.push(benefitsPackages.name.toLowerCase())
            lists.upd.push(...benefitsPackages.unique_plan_designs.map(upd => upd.upd.toLowerCase()))
        })
        return lists
    }, [data])


    // validate create benefits package form
    const newBenefitsPackageFormIsValid = useMemo (()=> {
        if (!existingUniqueFieldLists || ["avsn", "exchange", "metal_tier"].map(field => newBenefitsPackage[field]).include ("")){
            retunr false
        }
        return !["name", "upd"].map(field => {
            return !newBenefitsPackage[field] || existingUniqueFieldLists[field].includes(newBenefitsPackage[field].to)

        }).include(true);

    }, [existingUniqueFieldLists, newBenefitsPackage])

    //DataGrid columns 
const columns: GridColumns = [
    {
      field: "headname",
      headername: "Name",
      flex: 1.2,
      sortable: true,
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap", width: "100%" }}>
          {params.id === expandRow ? (
            <ArrowDropDownIcon />
          ) : (
            <ArrowRightIcon />
          )}
          <Link to={`benefits_packages/${params.id}`}>{params.value}</Link>
          {params.id === expandedRow && (
            <div style={{ width: "100%" }}>
              <br />
              <table style={{ border: 0, width: "100%" }}>
                <thead>
                  <tr style={{ border: 0 }}>
                    <th style={{ border: 0, whiteSpace: "nowrap" }}>
                      Unique Plan Design
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expandedRowData.map((row) => (
                    <tr key={row[0]} style={{ border: 0 }}>
                      <td>{row[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ),
    },
    {
      field: "exchange",
      headername: "Exchange",
      flex: 1,
      sortable: true,
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap", width: "100%" }}>
          {params.value}
          {params.id === expandedRow && (
            <div style={{ width: "100%" }}>
              <br />
              <table style={{ border: 0, width: "100%" }}>
                <thead>
                  <tr style={{ border: 0 }}>
                    <th style={{ border: 0, whiteSpace: "nowrap" }}>Type</th>
                    <th style={{ border: 0, whiteSpace: "nowrap" }}>
                      Variant Code
                    </th>
                    <th style={{ border: 0, whiteSpace: "nowrap" }}>
                      Product Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expandedRowData.map((row) => (
                    <tr key={row[0]} style={{ border: 0 }}>
                      <td>
                        {row[6] === "main"
                          ? "Main"
                          : row[6] === "override"
                          ? "Override"
                          : row[6]}
                      </td>
                      <td>{row[1]}</td>
                      <td>{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ),
    },
    {
      field: "metalTier",
      headername: "Metal Tier",
      flex: 1,
      sortable: true,
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap", width: "100%" }}>
          {params.value}
          {params.id === expandedRow && (
            <div style={{ width: "100%" }}>
              <br />
              <table style={{ border: 0, width: "100%" }}>
                <thead>
                  <tr style={{ border: 0 }}>
                    <th style={{ border: 0, whiteSpace: "nowrap" }}>State</th>
                    <th style={{ border: 0, whiteSpace: "nowrap" }}>Fed AVC</th>
                    <th style={{ border: 0, whiteSpace: "nowrap" }}>Fed AVC</th>
                  </tr>
                </thead>
                <tbody>
                  {expandedRowData.map((row) => (
                    <tr key={row[0]} style={{ border: 0 }}>
                      <td>{row[3]}</td>
                      <td>{row[4]}</td>
                      <td>{row[5]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ),
    },
  ];
    

    //regenerate DataGrid rows every time data changes
   useEffect(()=> {
    setRows([])
    if (offset === 0 || data?.result?.length === 0){
        //prevent out of range offset in case user adjusts it manually
        setPage(0)
        dataGridRef.current?.setOffset(0)
    }
    if (!error && data?.result?.length){
        const newSxClass = {}
        // create rows for DataGrid
        const rowMap = data.result.map(benefitsPackage => {
            const bp_id =  benefitsPackage._id.toString()
            if (expandedRow === bp_id){
                newSxClass[`& .custom-sx--${bp_id}`] = {backgroundColor: "#f5f5f5", "&:hover": {backgroundColor: "#f5f5f5"}};
                const upds = benefitsPackage.unique_plan_designs
                const mainUPDs ={}
                upds.filter(upd => upd.type === "main").forEach(upd => mainUPDs[upd["plan_variants"]] = upd)
                const sortedUPDs = sortUPDs(upds)
                setExpandedRowData(sortedUPDs.map((upd, i) => EXPANDED_COLOUMS.map(column =>
                    column === "type" && upd["type"] === "alias"?
                        upd["selectable"] ? "Selectable Alias": "Non-selectable Alias"
                        : getUPDFieldValue(sortedUPDs, i , column, mainUPDs[getUPDFieldValue(sortedUPDs, i , "plan_variant")])
                )))
            } else {
                newSxClass[`& .custom-sx--${bp_id}`] = null
            }

            return {
                id : benefitsPackage._id,
                name : benefitsPackage.name,
                exchange :  benefitsPackage.exchange,
                metalTier : benefitsPackage.metal_tier,

            }
        })
        setCustomeClass({...customClass, sx:newSxClass})
        setRows(rowMap)
        // update rowCount
        if(rowCount !== rowMap.length){
            setRowCount(rowMap.length)
        }
    }else {
        // if data come back with 0 results then rowCount should reflect that
        if  (data?.result?.length===0){
            setRowCount(0)
        }
    }
    //eslint-disable-next-line
   }, [data, expandedRow])

   const flattenUPDsWithNestedAliases = (baseList: TrapUniquePlanDesignWithChildren[], indentLevel:number, accumulator: TrapUniquePlanDesign[] )=>{
       baseList.forEach(baseUPD => {
        const {clildren, ...updWithoutChildren} = baseUPD;
        accumulator.push({...updWithoutChildren, upd:new Array(indentLevel).join("\u2003\u2002")+(indentLevel>0 ? "\u2006\u00a0\u2937" : "")+updWithoutChildren.upd})
        if(children?.length){
            flattenUPDsWithNestedAliases(children, indentLevel +1, accumulator)
        }
       })
   }

   const sortUPDs = (updList: TrapUniquePlanDesign[]):TrapUniquePlanDesign[] =>{
    const updsWithNestedUnselectableAliases: TrapUniquePlanDesign[] = updList.filter(upd=> !(upd.type==="alias" && !upd["selectable"])).map(upd =>
        ({...upd, children: updList.filter(subUPD => subUPD.type ==="alias" && !subUPD['selectable']&& subUPD.alias_for === upd.id)})
    )
    const sortedUPDs : TrapUniquePlanDesign[] = []
    flattenUPDsWithNestedAliases(updWithNestedOverrides.sort((a,b)=> a["plan_variant"]==="Base" ? -1 : b["plan_variant"]==="Base"? 1:0),0, sortedUPDs)
    return sortUPDs
   }

   const closeCreateBenefitsPackageModal = () => {
    if(createBenefitsPackageModalStatus !== "loading"){
        setNewBenefitsPackage(cloneDeep(EMPTY_PACKAGE))
        setCreateBenefitsPackageModalText("")
        setCreateBenefitsPackageStatus("closed")
    }
   }

   const submitNewBenefitsPackage = async () => {
    setCreateBenefitsPackageStatus("loading")
    const {avsn, upd , creatAliases, ...updatePackage} = newBenefitsPackage;
    const mainUPD : TrapMainUPD = {
        _id: "",
        upd: upd,
        type: "main",
        avsn:avsn,
        variant_code: "",
        product_type: "",
        state: "All",
        fed_avc: "",
        fed_avc_note: "",
        plan_marketing_name: "",
        plan_variant_marketing_name : "",
        deductible_inn: "",
        deductible_tier2 : "",
        moop_inn: "",
        moop_oon: "",
        moop_tier2: ""
        coinsurance_inn : "",
        coinsurance_oon : "",
        coinsurance_tier2: "",
        rx_deductible_inn: "",
        rx_deductible_tier2: "",
        rx_coinsurance_inn: "",
        rx_coinsurance_tier2: "",
        manual_rx_coinsurance_inn:false,
        manual_rx_coinsurance_tier2:false,
        benefits: [],
    }
    if (updatePackage.tiered){
        mainUPD["tier1_utilization"] = "100%"
    }
    updatePackage.unique_plan_designs.push(mainUPD)
    await axios.post(
        `${API_ROUTE.trap}/${activeYear}/benefits_packages?aliases = ${createAliases}.toString()`,
        updatePackage
    ).then(res => {
        closeCreateBenefitsPackageModal()
        history.push(/trap/benefits_packages/${res.data.message})
    }).catch(e => {
        setCreateBenefitsPackageModalText(e?.response?.data.message||e?.message || e)
        setCreateBenefitsPackageModalStatus("error")
    })

   }

   return (
    <Page title={"Benefits Package"}>
        <FilterQueryParamsManager searchLabel={"State"} filterOnUPD={true} />
        <Card
        title={"Benefits Packages"}
        headerActions={
            <Button onClick={() => setCreateBenefitsPackageStatus("initial")}>
            New Package
            </Button>
        }
        >{error?
            <div style={{width: "100%", textAlign: "center"}}>
                <ErrorText>the application encountered an error.</ErrorText>
            </div>
            :columns && data && rowCount !== undefined ?
            <>
               <div style = {{display : "flex"}}>
                <div style ={{marginLeft: "auto"}}>
                  <DataGridPaginator
                     offset ={offset}
                     page = {page}
                     pageSize = {rowCount}
                     handlePageChange = {e=>dataGridRef.current.handlePageChange(e)}
                     handlePageSizeChange = {e=>dataGridRef.current.handlePageSizeChange(e)}
                  />
                </div>
               </div>
               <DataGridComponent
                  {...props}
                  results= {true}
                  columns= {columns}
                  rows ={rows}
                  rowCount = {rowCount||0}
                  setRowCount = {setRowCount}
                  getRowHeight = {params => params.id === expanededRow ? (expandedRowData.length*22)+94:52}
                  OnRowClick = {(params, _) => setExpandedRow(params.id===expandedRow ? "":params.id)}
                  history = {history}
                  location = {location}
                  pagination = {{offset: offset,
                                page : page,
                                setPage: setPage,
                                pageSize: pageSize,
                                setPagegSize: setPageSize,
                                mode : "client"
                                }}
                  enableColumnFilter = {true}
                  disableSelectors ={true}
                  ref = { dataGridRef}
                  customSx = {customClass}
               />
            </>: 
            <div style ={{width : "100%" , textAlign : "center"}}>
              <Typography>Loading...</Typography>
            </div>

        }{
          createBenefitsPackageModalStatus !=="closed" &&
          <CreateTrapBenefitsPackageModal
            formIsValid = {newBenefitsPackageFormIsValid}
            modealStatus = {createBenefitsPackageModalStatus}
            modalText = { createBenefitsPackageModalText}
            newBenefitsPacakge = {newBenefitsPackage}
            onChange ={ packageFieldUpdate}
            onClose = {closeCreateBenefitsPackageModal}
            onSubmit = {submitNewBenefitsPackage}
          />
        }{
          errorText && 
          <Modal
            title = {"ERROR"}
            onClose = {()=> setErrorText("")}
            children = {
              <div>
                <ErrorText sx = {{whiteSpace : "pre-wrap"}}>{errorText}</ErrorText>
                <CancelButton sx = {{float : "right"}} onClick ={()=>setErrorText("")}>Close</CancelButton>
              </div>
            }
          />
        }
        </Card>
    </Page>
   )

}


export const getUPDFieldValue = (upds: TrapUniquePlanDesign[], thisIndex: number , field : string , mainPlanForVariant? : TrapUniquePlanDesign):any =>{
  const thisUPD = upds[thisIndex]
  if (Object.keys(thisUPD).iincludes(field)){
    return thisUPD[field]
  }
  if (thisUPD.type ==="alias"){
    const aliasTargetIndex  = upds.findIndex(upd => upd._id === thisUPD.alias_for)
    if (aliasTargetIndex === -1){
      return undefined
    }
    return getUPDFieldValue(upds, aliasTargetIndex, field, mainPlanForVariant)
  }
  if (!mainPlanForVariant || !Object.keys(mainPlanForVariant).includes(field)){
    return field === "tier1_utilization" ? "100%" : ""
  }
  return maiinPlanForVariant [field]
}

