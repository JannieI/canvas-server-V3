--USE [VCIB_DemoDat]; SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE';
------------------------ Overall -------------------------------------
SELECT
  'VCIB_RaisedPremiums'
, COUNT( * )
FROM VCIB_RaisedPremiums
;




SELECT
  'VCIB_ReceiptedPremiums'
, COUNT( * )
FROM VCIB_ReceiptedPremiums SELECT 'VCIB_LossRatios'
, COUNT(*) FROM VCIB_LossRatios SELECT 'VCIB_Claims'
, COUNT(*) FROM VCIB_Claims SELECT TOP 10 * FROM VCIB_RaisedPremiums
;




SELECT
  TOP 10 *
FROM VCIB_ReceiptedPremiums SELECT TOP 10 * FROM VCIB_LossRatios
;




SELECT
  TOP 10 *
FROM VCIB_Claims
;




-------------------------- Raised Premiums -------------------------
WITH GroupByMonth AS
(
    SELECT
      CAST( DATEPART( year,EffectiveDate ) AS varchar( 4 ) ) + '-' + FORMAT( DATEPART( month,EffectiveDate ),'00' ) AS YearMonth
    , 1 AS Number
    FROM VCIB_RaisedPremiums
)
SELECT
  YearMonth AS EffectiveDate
, COUNT( * ) AS Nr
FROM GroupByMonth
GROUP BY YearMonth
ORDER BY YearMonth
;




SELECT
  TransactionType
, COUNT( * ) AS Nr
FROM VCIB_RaisedPremiums
GROUP BY TransactionType
;




SELECT
  Product
, COUNT( * ) AS Nr
FROM VCIB_RaisedPremiums
GROUP BY Product
;




SELECT
  Broker
, COUNT( * ) AS Nr
FROM VCIB_RaisedPremiums
GROUP BY Broker
;




SELECT
  Agent
, COUNT( * ) AS Nr
FROM VCIB_RaisedPremiums
GROUP BY Agent
;




SELECT
  ClientID
, COUNT( * ) AS Nr
FROM VCIB_RaisedPremiums
GROUP BY ClientID
;




SELECT
  PolicyNoID
, COUNT( * ) AS Nr
FROM VCIB_RaisedPremiums
GROUP BY PolicyNoID
;




SELECT
  PaymentMethod
, COUNT( * ) AS Nr
FROM VCIB_RaisedPremiums
GROUP BY PaymentMethod
;




SELECT
  PaymentFrequency
, COUNT( * ) AS Nr
FROM VCIB_RaisedPremiums
GROUP BY PaymentFrequency
;




SELECT
  Coi
, COUNT( * ) AS Nr
FROM VCIB_RaisedPremiums
GROUP BY Coi
;




SELECT
  SubCoi
, COUNT( * ) AS Nr
FROM VCIB_RaisedPremiums
GROUP BY SubCoi
;




SELECT
  SasriaCoi
, COUNT( * ) AS Nr
FROM VCIB_RaisedPremiums
GROUP BY SasriaCoi
;




SELECT
  DISTINCT SasriaSubCoi
, COUNT( * ) AS Nr
FROM VCIB_RaisedPremiums
;




SELECT
  DISTINCT SasriaClassification
, COUNT( * ) AS Nr
FROM VCIB_RaisedPremiums
;




SELECT
  DISTINCT PolicyTransType
, COUNT( * ) AS Nr
FROM VCIB_RaisedPremiums
;




SELECT
  Broker
, FORMAT( SUM( SumInsured ),'C','en-za' ) AS SumInsured
, FORMAT( SUM( Fees ),'C','en-za' ) AS Fees
, FORMAT( SUM( BrokerFee ),'C','en-za' ) AS BrokerFee
, FORMAT( SUM( AgentFee ),'C','en-za' ) AS AgentFee
, FORMAT( SUM( RiskPremium ),'C','en-za' ) AS RiskPremium
, FORMAT( SUM( SasriaPremium ),'C','en-za' ) AS SasriaPremium
, FORMAT( SUM( NettRiskPremium ),'C','en-za' ) AS NettRiskPremium
, FORMAT( SUM( RetainedPremium ),'C','en-za' ) AS RetainedPremium
FROM VCIB_RaisedPremiums
GROUP BY Broker
;




----------------------- Loss Rations ------------------------------    
SELECT
  TOP 10 *
FROM VCIB_LossRatios
;




-------------- CLAIMS ---------------------------
SELECT
  TOP 10 *
FROM VCIB_Claims SELECT Product
, FORMAT( SUM( SumInsured )
, 'C'
, 'en-za' ) AS SumInsured
, FORMAT( SUM( TotalClaim )
, 'C'
, 'en-za' ) AS TotalClaim
, SUM( TotalClaim ) / SUM( SumInsured ) * 100 AS Percentage FROM VCIB_Claims
GROUP BY Product SELECT TOP 10 PolicyNo , FORMAT( FORMAT( SUM( SumInsured ),'C','en-za' ) AS SumInsured,FORMAT( FORMAT( SUM( TotalClaim ),'C','en-za' ) AS TotalClaim,SUM( TotalClaim ) / SUM( SumInsured ) * 100 AS Percentage FROM VCIB_Claims
GROUP BY PolicyNo
ORDER BY SUM( TotalClaim ) DESC SELECT TOP 10 ClaimNo , FORMAT( SUM( SumInsured ),'C','en-za' ) AS SumInsured , FORMAT( SUM( TotalClaim ),'C','en-za' ) AS TotalClaim , SUM( TotalClaim ) / SUM( SumInsured ) * 100 AS Percentage FROM VCIB_Claims
GROUP BY ClaimNo
ORDER BY SUM( TotalClaim ) DESC SELECT Coi , FORMAT( SUM( SumInsured ),'C','en-za' ) AS SumInsured , FORMAT( SUM( TotalClaim ),'C','en-za' ) AS TotalClaim , SUM( TotalClaim ) / SUM( SumInsured ) * 100 AS Percentage FROM VCIB_Claims
GROUP BY Coi SELECT SubCoi , FORMAT( SUM( SumInsured ),'C','en-za' ) AS SumInsured , FORMAT( SUM( TotalClaim ),'C','en-za' ) AS TotalClaim , SUM( TotalClaim ) / SUM( SumInsured ) * 100 AS Percentage FROM VCIB_Claims
GROUP BY SubCoi SELECT ClaimTransType , FORMAT( SUM( SumInsured ),'C','en-za' ) AS SumInsured , FORMAT( SUM( TotalClaim ),'C','en-za' ) AS TotalClaim , SUM( TotalClaim ) / SUM( SumInsured ) * 100 AS Percentage FROM VCIB_Claims
GROUP BY ClaimTransType SELECT Broker , FORMAT( SUM( SumInsured ),'C','en-za' ) AS SumInsured , FORMAT( SUM( TotalClaim ),'C','en-za' ) AS TotalClaim , SUM( TotalClaim ) / SUM( SumInsured ) * 100 AS Percentage FROM VCIB_Claims
GROUP BY Broker SELECT TOP 10 PostalCode , FORMAT( SUM( SumInsured ),'C','en-za' ) AS SumInsured , FORMAT( SUM( TotalClaim ),'C','en-za' ) AS TotalClaim , SUM( TotalClaim ) / SUM( SumInsured ) * 100 AS Percentage FROM VCIB_Claims
GROUP BY PostalCode
ORDER BY SUM( TotalClaim ) DESC SELECT TOP 10 Suburb , FORMAT( SUM( SumInsured ),'C','en-za' ) AS SumInsured , FORMAT( SUM( TotalClaim ),'C','en-za' ) AS TotalClaim , SUM( TotalClaim ) / SUM( SumInsured ) * 100 AS Percentage FROM VCIB_Claims
GROUP BY Suburb
ORDER BY SUM( TotalClaim ) DESC WITH GroupByMonth AS
(
    SELECT
      CAST( DATEPART( year,DateofLoss ) AS varchar( 4 ) ) + '-' + FORMAT( DATEPART( month,DateofLoss ),'00' ) AS YearMonth
    , 1 AS Number
    FROM VCIB_Claims
) SELECT YearMonth AS DateofLoss , COUNT(*) AS Nr FROM GroupByMonth
GROUP BY YearMonth
ORDER BY YearMonth
;




SumInsured TotalClaim-- 