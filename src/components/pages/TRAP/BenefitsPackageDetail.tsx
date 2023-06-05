import React, {useContext} from "react";
import {RouteComponetProps} from "react-router";
import {Page} from "../../Page";
import {Card} from "../../Card";
import {useTrapBenefitsPackageDetail} from "../../hooks/TRAP/useTrapBenefitsPacakgeDetail";
import {Button, Checkbox, FormControl, InputAdornment, InputLabel, MenuItem, Select, Tab, Tabs, TextField, Typography} from "@mui/material";
import {useState} from "react";
import {useEffect} from "react";
import {cloneDeep} from "lodash";
import {conformationalModal, ModalStatus } from "../../Modal/ConfirmationModal";
import {ErrorText} from "../../styled/Text";
import {ButtonLink, CancelButton} from "../../styled/Button";
import {muiTheme} from "../../../theme";
import {Modal} from "../../Modal";
import {useMemo} from "react";
import {TrapMainUPD, TrapUniquePlanDesign} from "../../../types";
import {getUPDFiledValue} from "./BenefitsPackages";
import {API_ROUTES, axios} from "../../../axiosInstance";
import {StateContext} from "../../../Store";
import {filterUnwantedCharacters} from "../../../lib/utils"
import {useTrapBenefitsPackages} from "../../../hooks/Trap/useTrapBenefitsPackages";
import Delete from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton/IconButton";
import {CostSharesGridComponent} from "../../TRAP/CostSharesGridComponent";
import {GridColumns, GridRowsProp} from "@mui/x-data-grid";

const UPD_FIELDS = [
    ["upd"],
    ["avsn", "product_type"],
    ["plan_marketing_name","state"],
    ["plan_variant_marketing_name", "variant_code"],
]

const AV_FIELD = ["target_av", "av_testing_metallic_tier", "fed_avc", "fed_avc_note"] 
const HIGH_LEVEL_DESIGN_FIELDS = ["deductible", "moop", "coinsurance", "rx_detuctible", "rx_coinsurance"]
const FIELD_LABEL_GLOSSARY = {
    avsn : "AV_Screenshot_name",
    av_testing_metallic_tier : "AV Testing Metallic Tier",
    fed_avc: "Fed AVC",
    fed_avc_note : "Fed AVC Note",
    plan_design_option: "Plan Design Option",
    plan_variant_marketing_name : "Plan Variant Marketing Name",
    product_type : "Product Type",
    state : "State",
    target_av : "Target AV",
    upd : "unique plan design",
    variant_code : "variant_code",
    deductible: "Medical Benefits Deductible",
    moop : "Medical Benefits MOOP",
    coinsurance: "Medical Benefits Coinsurance",
    rx_deductible : " Rx Benefits Deductible",
    rx_coinsurance : "Rx Benefits Coinsurace",
}

interface RouteParams {
    _id : string;
}

const columns: GridColumns = [
    {
       field : "type",
       headername : "Type",
       flex:1
    },
    {

    }

]
export const TrapBenefitsPackageDetailPage = (props: RoutecomponentProps<RouteParams>) =>{
    const package_id = props.match.params._id;
    const {activeYear}  = useContext(StateContext).settings;
    const formControlProps = muiTheme?.components?.MuiFormControl?.defaultProps?.sx || {}
    const mainValueTextStyles = {marginTop : "-rem", fontstyle : "Italic", color :"#8c857B"};
    const highLevelDesignHeaderSytle = {fontWeight :"bold", padding: 1 borderTop : "1px solid #DDDDDD"};
    cosnt {DataTransfer, error} = useTrapBenefitsPackageDetail(package_id);
    const {data: allPackages} useTrapBenefitsPackages();
    //@ts-ignore
    const variantOptions = useMemo(() => [...new Set(data?.unique_plan_designs.filter(upd=> upd.type !== "alias").map(upd =>upd.[plan_variant]))], data);
    const [autoBlurId, setAutoBlurId] = useState<string|undefined> ();
    const [allowRxCoinsuranceEdit, setAllowRxCoinsuranceEdit] = useState <{inn:boolean,tier2:boolean}>({inn:false,tier2:false});
    const [selectValues, setSelectValues] = useState <{product_type:string, state: string , variant_code:string}>();
    const [confirmationModalStatus, setConfirmationModalStatus] = useState<ModalStatus> ("Closed");
    const [confirmationModalTitle, setConfirmationModalMessage] = useState <JSX.Element|String> ("");
    const [mainUpdForVariant, setMainUpdForVariant] = useState <string> ("");
    const [seletedUpd, setSelectedUpd] = useState <TrapMainUPD>();
    const [selectedUpdIndex, setSelectedUpdIndex] = useState <number>();
    const [selectedPlanVariant, setSelectedPlanVariant] = useState <string>("Base");
    const [packageNameFieldValue ,setPackageNameFieldValue] = useState<string>("")
    const [errorText, setErrorText] = useState<string>("");
    const [selectedPlanDesignTab, setSelectedPlanDesignTab] = useState<string>("detail");

    const seletedUpdTier1Utilization:string = useMemo(()=> {
        if (selectedUpdIndex&& selectedUpdIndex.type !== "alias" && mainUpdForVariant && mainUpdForVariant.type ==="main" && selectedUpdIndex.plan_variant === mainUpdForVariant){
         return getUPDFieldValue([selectedUpd], 0 , "tier1_utilization", mainUpdForVariant).replace("%", "")
        }else{
            return 100
        }
    },
    [selectedUpd, mainUpdForVariant])

    const flatUpdList: string []= useMemo (()=> (
         allPackages?.result.flatMap(benefitsPackage=>
            (benefitsPackage.unique_plan_designs?? []).flatMap(upd => upd.upd.toLowerCase()))||[]
    ), [allPackages])

    useEffect (()=> {
        if {selectedUpd && mainUpdForVariant}{
            setSelectValues({
                product_type: getUPDFieldValue([selectedUpd], 0 ,"product_type", mainUpdForVariant),
                state: getUPDFiledValue([selectedUpd], 0, "state", mainUpdForVariant),
                variatn_code : getUPDFieldValue([selectedUpd], 0 , "variant_code", mainUpdForVariant),
            })
        }
    }, [selectedUpd, mainUpdForVariant])


    useEffect (()=>{
        if (data && selectedUpdIndex ! == undefined){
            setSelectedUpd ( cloneDeep(data.unique_plan_designs[selectedUpdIndex]))
            setPackageNameFieldValue(data.name)
        }
    }, [data, selectedUpdIndex])

    useEffect(()=>{
        if (selectedUpd && mainUpdForVariant){
            const inn = GetUPDFieldValue ( [selectedUpd], 0 , "manual_rx_coinsurance_inn", mainUpdForVariant)
        } 
    },[selectedUpd,mainUpdForVariant])
    
     useEffect(()=>{
        if(data){
            const mainPlan = data.unique_plan_desings.find(upd=> update.type === "main" && update.plan_variant === selectedPlanVariant)
            if (!mainPlan){
                setSelectedPlanVariant(variantOption[0])
                setErrorText(`No main plan found for plan variant d${selectedPlanVariat}`)
            }
            setMainUpdForVariant(mainPlan as TrapMainUPD)
        }
     }, [data, selectedPlanVariant])

     useEffect(()=>{}
     ,[data, selectedUpd, selectedPlanVariant])

     useEffect(()=>{}
     ,[selectedUpdIndex, data])

     useEffect(()=>{}
     ,[autoBlurId])

     const mainValueDisplay = (field) : string => {
        if (selectedUpd && mainUpdForVariant){
            if (selectedUpd.type !== "main" && Object,keys(selectedUpd).includes(field)){
                return mainUpdForVariant[field]
            }
        }
        return "\u0000"
     }

     const handleKeyDown = (event, isPackageName = false)=>{
        if (data){
            const key = event.key;
            if (key ==="Escape" ){
                document?.getElementById(event.target.id)?blur()
            }else{
                setAutoBlurId(event.target.id)
            }
            if(selectedUdpIndex !== undefined){
                setSelectedUpd(cloneDeep(data.unique_plan_designs[selectedUpdIndex]))
            }
        } else if (key ==="Enter"){
            if (isPackageName){
                handleNameFieldBlur()
            }else if{
                validateUpdLevelFieldChange(event)
            }
        }
     }


     const closeConfirmmationModal = ()=> {
        if (confirmationModalStatus !== "success" && data && selectedUpd){
            if (confirmationModalTitle ==="Rename Benefits Package"){
                setPackageNameFieldValut(data.Name)

            }else if(selectedUpdIndex !== undefined && confirmationModalTitle === " Rename Unique Plan Design"){
                setSelectedUpd ({...selectedUpd, upd: data.unique_plan_designs[selectedUpdIndex].upd})
            }
        }

        setConfirmationModalStatus("closed");
        setConfirmationModalTitle("")
        setConfirmationModalMessage("")
     }

     const handleCheckboxChange = event =>{
        if(mainUpdForVariant && selectedUpd){
            const newValue = event.target.checked;
            const field = event.target.id;
            const tier = field.split("_")[3];
            setAllowRxCoinsuranceEdit({...allowRxCoinsuranceEdit, [tier]:newValue})
            axios.put(`${API_ROUTES.trap}/${activeYear}/unique_plan_designs/${selectedUpd._id}`, {[field]:newValue}).then().cathc(

            )
        }
     }

     const handleUtilizationUpdate = event => {
        const newValue event.target.value;
        if(newVlaue === ""||(!isNaN(newValue)&&newValue >=0 && newValue<= 100)){
            event.target.value = newVaule === "" ?: "" : newValue.toString() + "%"
            handleUpdLevelFieldUpdate(event)
        }
     }

     const handlePlanDesignTabChange = (event, selectedTab)=>{
        setSelectedPlanDesignTab(selectedTab);
     };

     const validateUpdLevelFieldChange = event => {
        const field = event.target.id
        if(autoBlurId){
            setAutoBlurId(undefined)
        }else if(field ==="upd"){
            confirmUpdNameChange()
        }else if (data && selectedUpd && mainUpdForVariant){
            if (event.type === "keydown"){
                document?.getElementById(event.target.id)?.blur()
            }else if (event.type ==="blur"&& !Object.keys(selectedUpd).includes(event.target.id)){
                return
            }

            const valueToCheck = !field.startsWith("manual_rx_coinsurance")? filterUnwantedCharacters(selectedUpd[field]):selectedUpd[field]
            if(selectedUpdIndex!==undefined && valueForUpdate !== DataTransfer.unique_plan_desings[selectedUpdIndex][field]){
                submitUdpLevelFieldChange(field,valueForUpdate)
            }
        }
     }

     const sumbitUpdFieldChange = (field, value) => {
        
     }

     const handleNameFieldBlur = ()=>{

     }

     const confirmUdpNameChange =() =>{

     }

     const submitUpdNameChange =()=>{

     }

     const submitPackageNameChange = () =>{

     }
     
    return (
        <Page>
            {error ? <ErrorText>{error}</ErrorText> :!data ||!selectedUpd ||!mainUpdForVariant ? "Loading...":
            <div>
                <Card
                 title = " Benefits Package"
                 headerActions ={ data && 
                    <ButtonLink href= {`/trap/benefits_packages/${data._id}/changes`} variant = {"outlined"}>
                        View Changes
                    </ButtonLink>
                }
                >
                    <div style= {{borderTop: "1px solid #DDDDDD", borderBottom: "1px solid #DDDDDD", display: "flex"}}>
                        <FormControl sx={{mt:0}}>
                            <TextField id={name}
                                    autoComplete = {"off"}
                                    label = {"Name"}
                                    value = {packageNameFieldValue}
                                    onChange = {e=> setPackageNameFieldValue(e.target.value)}
                                    onBlur = {handleNameFieldBlur}
                                    onKeyDown={e=>handleKeyDown(e, true)}
                            />
                        </FormControl>
                        <FormControl onKeyDown = {e=> e.key ==="Escape"&&document?.getElementById("plan_variant")?.blur()}>
                            <InputLabel id ={"plan_variant-label"}>Plan Variant</InputLabel>
                            <Select id ={"plan_variant"}
                                     value ={selectedPlanVariant}
                                     onChange ={e=>setSelectedPlanVariant(e.target.value)}
                            >
                                {variantOptions.sort((a,b)=>a==="Base"? -1:b==="Base"?1:a<b?-1:0).map(variantOption =>
                                <MenuItem key={variantOption} value={variantOption}>{variantOption}</MenutItem>
                                )}
                            </Select>
                        </FormControl>
                        <Typography>Metal Tier</Typography>
                        <Typography>Exchange</Typography>
                        <Typography>Integrated Medical and Rx Deductible</Typography>
                        <Typography>Tiered Plan</Typography>
                        <Typography>HSA</Typography>

                    </div>
                    <div>
                        <Tabs value = {selectedPlanDesignTab} onChange={handlePlanDesignTabChange}>
                            <Tab value={"detail"} label="Plan Design Detail"/>
                            <Tab value={"list"} label="Plan Design List"/>
                        </Tabs>
                    </div>
                    <div style = {{display: "flex"}}>
                        {selectedPlanDesignTab === 0 && (
          
                        
                            <div>
                                <div>
                                    <FormControl sx>
                                        <InputLabel id="unique_plan_design_label"></InputLabel>
                                        <Select
                                            id = {"unique_plan_design"}
                                            labelId ={"unique_plan_design-label"}
                                            onChange = {e=>setSelectedUdpIndex(e.target.value as number)}
                                            
                                        >
                                            {data.unique_plan_designs.map((upd, i)=>
                                            upd.type!=="alias" && upd.plan_variant === selectedPlanVariant && <MenuItem key = {`upd-${i}`} value={i}>{upd.upd}</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                    <FormControl sx>
                                        <InputLabel id="plan-design-option-label"></InputLabel>
                                        <Select
                                            id = {"plan-design-option"}
                                            labelId ={"plan-design-option-label"}
                                            onChange = {e=>setSelectedUdpIndex(e.target.value as number)}
                                            
                                        >
                                            {data.unique_plan_designs.map((upd, i)=>
                                            upd.type!=="alias" && upd.plan_variant === selectedPlanVariant && <MenuItem key = {`upd-${i}`} value={i}>{upd.upd}</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                </div>
                                <div style={{width : "49.1rem", marginTop:"1rem"}}>
                                    <Card>

                                    </Card>
                                </div>
                            </div>
                            <div style = {{marginLeft : "auto", marginTop:"auto", width:"15.3rem"}}>
                                <Card ttile ="AV Caculator">

                                </Card>
                            </div>
                         )}
                    </div>
                </Card>
                <Card title="High Level Design">

                </Card>
            </div>

            }
        </Page>
    )

}